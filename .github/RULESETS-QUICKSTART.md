# Quick Start: Applying GitHub Rulesets

This guide helps you quickly apply the recommended rulesets to your repository.

## Prerequisites

- Repository admin access
- GitHub account with appropriate permissions

## Step 1: Navigate to Repository Settings

1. Go to your repository on GitHub: `https://github.com/sixtusVI/warehouse-app`
2. Click **Settings** (top right)
3. In the left sidebar, scroll down to **Code and automation** section
4. Click **Rulesets**

## Step 2: Import Rulesets

For each ruleset file in `.github/rulesets/`:

### Main Branch Protection
1. Click **New ruleset** → **Import a ruleset**
2. Upload `.github/rulesets/main-branch-protection.json`
3. Review the configuration:
   - Name: `main-branch-protection`
   - Target: `main` branch
   - Enforcement: Active
4. Click **Create** to activate

### Release Tag Protection
1. Click **New ruleset** → **Import a ruleset**
2. Upload `.github/rulesets/release-tag-protection.json`
3. Review the configuration:
   - Name: `release-tag-protection`
   - Target: Tags matching `v*`
   - Enforcement: Active
4. Click **Create** to activate

### Feature Branch Conventions
1. Click **New ruleset** → **Import a ruleset**
2. Upload `.github/rulesets/feature-branch-conventions.json`
3. Review the configuration:
   - Name: `feature-branch-conventions`
   - Target: `feature/*`, `bugfix/*`, `hotfix/*` branches
   - Enforcement: Active
4. Click **Create** to activate

## Step 3: Verify Rulesets

After importing, verify that all three rulesets appear in the Rulesets list:
- ✅ `main-branch-protection` (Active)
- ✅ `release-tag-protection` (Active)
- ✅ `feature-branch-conventions` (Active)

## Step 4: Test the Rulesets

Test that rulesets are working:

1. **Test Main Branch Protection:**
   ```bash
   # Try to push directly to main (should be blocked)
   git checkout main
   echo "test" >> test.txt
   git add test.txt
   git commit -m "Test commit"
   git push origin main  # Should fail - requires PR
   ```

2. **Test Feature Branch:**
   ```bash
   # Create a feature branch (should work)
   git checkout -b feature/test-rulesets
   git push origin feature/test-rulesets  # Should succeed
   ```

3. **Create a Pull Request:**
   - Create PR from `feature/test-rulesets` to `main`
   - PR should require approval before merging

## Customization Options

### Testing Before Enforcing

To test rulesets without blocking operations:

1. Open the ruleset in GitHub Settings
2. Change **Enforcement** from `Active` to `Evaluate`
3. Save changes
4. Monitor rule insights to see what would be blocked
5. When ready, change back to `Active`

### Adding Bypass Permissions

To allow specific users/teams to bypass rules:

1. Open the ruleset
2. Scroll to **Bypass list**
3. Click **Add bypass**
4. Select users, teams, or roles
5. Choose bypass mode (`Always` or `Pull requests only`)
6. Save changes

**Warning:** Use bypass permissions sparingly to maintain security.

## Troubleshooting

### Issue: Cannot Import Ruleset
- **Solution:** Ensure you have admin permissions on the repository

### Issue: Ruleset Not Blocking Operations
- **Solution:** Check that enforcement is set to `Active`, not `Evaluate`

### Issue: Too Restrictive
- **Solution:** Temporarily switch to `Evaluate` mode and adjust rules

### Issue: Need to Delete a Ruleset
1. Go to Settings → Rulesets
2. Click on the ruleset name
3. Scroll to bottom and click **Delete ruleset**

## Alternative: Manual Configuration

If you prefer to configure manually instead of importing JSON:

1. Click **New ruleset** → **New branch ruleset**
2. Enter the ruleset name (e.g., `main-branch-protection`)
3. Set target branches (e.g., `main`)
4. Enable desired rules:
   - ☑️ Require pull request before merging
   - ☑️ Require approvals (1)
   - ☑️ Dismiss stale pull request approvals
   - ☑️ Require status checks to pass
   - ☑️ Block force pushes
   - ☑️ Prevent deletion
5. Click **Create** to save

Repeat for other rulesets with appropriate configurations.

## Next Steps

- Review [RULESETS.md](RULESETS.md) for detailed documentation
- Monitor rule insights in repository settings
- Consider adding additional rulesets for your workflow
- Update rulesets as your team's needs evolve

## Support

For questions or issues:
- Review [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets)
- Check [GitHub Ruleset Recipes](https://github.com/github/ruleset-recipes)
- Open an issue in this repository
