# GitHub Repository Rulesets

This repository uses GitHub rulesets to enforce governance, workflow conventions, and protection rules across branches and tags. Rulesets help maintain code quality and prevent accidental or malicious changes to critical branches.

## Overview

GitHub rulesets are configured in the `.github/rulesets/` directory as JSON files. These files can be imported via the GitHub UI or API to apply the rules to your repository.

## Recommended Ruleset Names and Purposes

### 1. `main-branch-protection`
**Target:** `main` branch  
**Enforcement:** Active  
**Purpose:** Protects the main branch from unauthorized or unsafe changes

**Rules Applied:**
- ✅ **Pull Request Reviews Required**: At least 1 approving review needed before merging
- ✅ **Dismiss Stale Reviews**: Reviews are dismissed when new commits are pushed
- ✅ **Required Review Thread Resolution**: All review comments must be resolved
- ✅ **Status Checks Required**: Configured status checks must pass before merging
- ✅ **Block Force Pushes**: Prevents force pushing to maintain history integrity
- ✅ **Block Deletions**: Prevents accidental deletion of the main branch

**Naming Convention:** `[branch-name]-branch-protection`

---

### 2. `release-tag-protection`
**Target:** Tags matching `v*` pattern (e.g., v1.0.0, v2.1.3)  
**Enforcement:** Active  
**Purpose:** Protects release tags from modification or deletion

**Rules Applied:**
- ✅ **Block Tag Updates**: Prevents modification of existing tags
- ✅ **Block Tag Deletions**: Prevents deletion of release tags
- ✅ **Required Linear History**: Ensures clean, linear commit history

**Note:** Tag creation is allowed for all users. To restrict tag creation to specific users or teams, add bypass actors to the ruleset and enable the "creation" rule.

**Naming Convention:** `release-tag-protection`

---

### 3. `feature-branch-conventions`
**Target:** Feature, bugfix, and hotfix branches (`feature/*`, `bugfix/*`, `hotfix/*`)  
**Enforcement:** Active  
**Purpose:** Enforces naming conventions and protections for development branches

**Rules Applied:**
- ✅ **Block Deletions**: Prevents accidental deletion of active feature branches
- ✅ **Required Linear History**: Encourages clean commit history with rebasing

**Naming Convention:** `feature-branch-conventions`

---

## Ruleset Naming Best Practices

When creating or modifying rulesets, follow these naming conventions for clarity and maintainability:

### Pattern: `[scope]-[target]-[purpose]`

Examples:
- `main-branch-protection` - Protects the main branch
- `prod-branch-require-reviews` - Requires reviews on production branch
- `release-tag-protection` - Protects release tags
- `dev-branch-naming-conventions` - Enforces naming on development branches
- `security-critical-files-protection` - Protects security-sensitive files

### General Guidelines:

1. **Be Descriptive**: Name should clearly indicate what the ruleset does
2. **Use Kebab-Case**: Separate words with hyphens (e.g., `main-branch-protection`)
3. **Indicate Scope**: Include the target (branch, tag, or file pattern)
4. **Express Purpose**: Clearly state what the ruleset enforces
5. **Keep It Concise**: Aim for 2-4 words when possible
6. **Be Consistent**: Use similar patterns across all rulesets
7. **Version When Needed**: Add version suffix if policies evolve (e.g., `main-protection-v2`)

---

## How to Apply These Rulesets

### Option 1: GitHub Web UI

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Rulesets**
3. Click **New ruleset** → **Import a ruleset**
4. Upload the JSON files from `.github/rulesets/`
5. Review and activate the rulesets

### Option 2: GitHub API

Use the GitHub REST API to programmatically create rulesets:

```bash
# Create a ruleset using the API
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/sixtusVI/warehouse-app/rulesets \
  -d @.github/rulesets/main-branch-protection.json
```

### Option 3: Terraform

Use the GitHub Terraform provider:

```hcl
resource "github_repository_ruleset" "main_protection" {
  name        = "main-branch-protection"
  repository  = "warehouse-app"
  target      = "branch"
  enforcement = "active"
  
  # ... rules configuration
}
```

---

## Customizing Rulesets

To customize these rulesets for your needs:

1. **Modify Enforcement**: Change `"enforcement": "active"` to `"evaluate"` for testing
2. **Adjust Rules**: Add or remove rules based on your workflow
3. **Update Conditions**: Change branch or tag patterns to match your naming conventions
4. **Add Bypass Actors**: Specify users or teams that can bypass rules (use sparingly)

Example bypass configuration:
```json
"bypass_actors": [
  {
    "actor_id": 1,
    "actor_type": "RepositoryRole",
    "bypass_mode": "always"
  }
]
```

---

## Additional Ruleset Ideas

Consider these additional rulesets for enhanced governance:

### Development Workflow
- `require-signed-commits` - Enforce commit signing
- `branch-naming-conventions` - Validate branch name patterns
- `commit-message-format` - Enforce conventional commits

### Security
- `block-secrets-push` - Prevent pushing secrets
- `require-codeql-scans` - Require security scanning
- `sensitive-file-protection` - Protect configuration files

### Quality Assurance
- `require-tests-passing` - Ensure test suite passes
- `require-linting-checks` - Enforce code style
- `block-breaking-changes` - Prevent API breaking changes

---

## Monitoring and Compliance

- **Rule Insights**: Use GitHub's rule insights to see blocked operations
- **Audit Logs**: Track ruleset changes in repository audit logs
- **Notifications**: Configure alerts for rule violations
- **Evaluate Mode**: Test new rulesets before enforcing them

---

## References

- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets)
- [GitHub Ruleset Recipes](https://github.com/github/ruleset-recipes)
- [GitHub Well-Architected - Rulesets Best Practices](https://wellarchitected.github.com/)
- [Terraform GitHub Provider - Rulesets](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/repository_ruleset)

---

## Maintenance

**Last Updated:** January 24, 2026  
**Version:** 1.0  
**Maintained by:** Repository Administrators

To update these rulesets:
1. Edit the JSON files in `.github/rulesets/`
2. Re-import them via GitHub UI or API
3. Test in evaluate mode first
4. Update this documentation accordingly
