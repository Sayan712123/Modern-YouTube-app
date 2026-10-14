export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  html_url: string;
  public_repos: number;
  scopes?: string[];
  hasRepoScope?: boolean;
  hasWorkflowScope?: boolean;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  clone_url: string;
  private: boolean;
  default_branch?: string;
}

export interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  event?: string;
}

export interface GitHubDiagnostic {
  tokenValid: boolean;
  tokenScopes: string[];
  hasRepoScope: boolean;
  hasWorkflowScope: boolean;
  userLogin?: string;
  repoExists: boolean;
  repoDefaultBranch?: string;
  hasWorkflowFile: boolean;
  recentRunStatus?: string;
  identifiedIssue?: string;
  recommendedAction?: string;
}

const GITHUB_API_BASE = 'https://api.github.com';

export async function verifyGitHubToken(token: string): Promise<GitHubUser> {
  const cleanToken = token.trim();
  const res = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) {
      throw new Error('401 Unauthorized: The GitHub Personal Access Token is invalid, expired, or has typos.');
    }
    throw new Error(err.message || 'Invalid GitHub token. Please verify token permissions.');
  }

  // Parse OAuth scopes from headers
  const scopesHeader = res.headers.get('x-oauth-scopes') || '';
  const scopes = scopesHeader.split(',').map((s) => s.trim()).filter(Boolean);
  const hasRepoScope = scopes.includes('repo') || scopes.includes('public_repo');
  const hasWorkflowScope = scopes.includes('workflow');

  const userData = await res.json();
  return {
    ...userData,
    scopes,
    hasRepoScope,
    hasWorkflowScope,
  };
}

export async function createGitHubRepo(
  token: string,
  repoName: string,
  isPrivate: boolean,
  description: string
): Promise<GitHubRepo> {
  const cleanToken = token.trim();
  const res = await fetch(`${GITHUB_API_BASE}/user/repos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: repoName,
      description,
      private: isPrivate,
      auto_init: true,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // If repo already exists on user account, fetch it
    if (res.status === 422 && err.message?.includes('already exists')) {
      const user = await verifyGitHubToken(cleanToken);
      const getRepoRes = await fetch(`${GITHUB_API_BASE}/repos/${user.login}/${repoName}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (getRepoRes.ok) {
        return getRepoRes.json();
      }

      return {
        name: repoName,
        full_name: `${user.login}/${repoName}`,
        html_url: `https://github.com/${user.login}/${repoName}`,
        clone_url: `https://github.com/${user.login}/${repoName}.git`,
        private: isPrivate,
        default_branch: 'main',
      };
    }
    throw new Error(err.message || 'Failed to create GitHub repository');
  }

  return res.json();
}

export async function commitFileToRepo(
  token: string,
  owner: string,
  repo: string,
  filePath: string,
  content: string,
  commitMessage: string,
  branch?: string
): Promise<void> {
  const cleanToken = token.trim();
  let sha: string | undefined = undefined;
  
  // Find branch if not specified
  let targetBranch = branch;
  if (!targetBranch) {
    try {
      const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (repoRes.ok) {
        const repoData = await repoRes.json();
        targetBranch = repoData.default_branch || 'main';
      }
    } catch {
      targetBranch = 'main';
    }
  }

  // Check if file exists to acquire sha for updates
  try {
    const checkRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}?ref=${targetBranch || 'main'}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (checkRes.ok) {
      const data = await checkRes.json();
      sha = data.sha;
    }
  } catch {
    // File doesn't exist yet, proceed with creation
  }

  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: encodedContent,
      branch: targetBranch || 'main',
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 422 && err.message?.includes('without the \'workflow\' scope')) {
      throw new Error(
        'GitHub Error: Your token lacks the "workflow" scope required to commit .github/workflows. Please generate a token with both "repo" AND "workflow" checked.'
      );
    }
    throw new Error(`Failed to commit ${filePath}: ${err.message || 'Unknown error'}`);
  }
}

export async function triggerApkWorkflow(
  token: string,
  owner: string,
  repo: string
): Promise<void> {
  const cleanToken = token.trim();

  // Retrieve repo default branch
  let defaultBranch = 'main';
  try {
    const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (repoRes.ok) {
      const data = await repoRes.json();
      defaultBranch = data.default_branch || 'main';
    }
  } catch {
    defaultBranch = 'main';
  }

  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/build-apk.yml/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref: defaultBranch,
    }),
  });

  if (!res.ok) {
    // Fallback if main/master differs
    const altBranch = defaultBranch === 'main' ? 'master' : 'main';
    const retryRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/build-apk.yml/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: altBranch,
      }),
    });

    if (!retryRes.ok) {
      const err = await retryRes.json().catch(() => ({}));
      if (retryRes.status === 404) {
        throw new Error('Workflow file ".github/workflows/build-apk.yml" not found or GitHub Actions is not enabled for this repository.');
      }
      if (retryRes.status === 403) {
        throw new Error('GitHub Actions permission denied (403). Ensure Actions are enabled in your repo Settings > Actions > General.');
      }
      throw new Error(`Failed to trigger workflow: ${err.message || 'Check GitHub Actions tab'}`);
    }
  }
}

export async function getWorkflowRuns(
  token: string,
  owner: string,
  repo: string
): Promise<WorkflowRun[]> {
  const cleanToken = token.trim();
  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs?per_page=5`, {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.workflow_runs || [];
}

/**
 * Diagnostic tool to analyze GitHub setup and identify why an issue is occurring.
 */
export async function runGitHubDiagnostics(token: string, repoName: string): Promise<GitHubDiagnostic> {
  const diagnostic: GitHubDiagnostic = {
    tokenValid: false,
    tokenScopes: [],
    hasRepoScope: false,
    hasWorkflowScope: false,
    repoExists: false,
    hasWorkflowFile: false,
  };

  if (!token.trim()) {
    diagnostic.identifiedIssue = 'No GitHub Token Provided';
    diagnostic.recommendedAction = 'Please generate a GitHub Personal Access Token (Classic) with "repo" and "workflow" scopes.';
    return diagnostic;
  }

  // 1. Check token & scopes
  try {
    const user = await verifyGitHubToken(token);
    diagnostic.tokenValid = true;
    diagnostic.userLogin = user.login;
    diagnostic.tokenScopes = user.scopes || [];
    diagnostic.hasRepoScope = !!user.hasRepoScope;
    diagnostic.hasWorkflowScope = !!user.hasWorkflowScope;

    if (!diagnostic.hasRepoScope || !diagnostic.hasWorkflowScope) {
      diagnostic.identifiedIssue = 'Missing Required Scopes ("repo" or "workflow")';
      diagnostic.recommendedAction = `Your token currently has [${diagnostic.tokenScopes.join(', ') || 'none'}]. It needs both "repo" (to push code) and "workflow" (to create the CI/CD pipeline).`;
      return diagnostic;
    }
  } catch (err: unknown) {
    diagnostic.identifiedIssue = err instanceof Error ? err.message : 'Token verification failed';
    diagnostic.recommendedAction = 'Generate a new token at https://github.com/settings/tokens/new with "repo" and "workflow" selected.';
    return diagnostic;
  }

  // 2. Check repo
  const owner = diagnostic.userLogin!;
  try {
    const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repoName}`, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (repoRes.ok) {
      const repoData = await repoRes.json();
      diagnostic.repoExists = true;
      diagnostic.repoDefaultBranch = repoData.default_branch;

      // 3. Check workflow file
      const wfRes = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repoName}/contents/.github/workflows/build-apk.yml?ref=${repoData.default_branch || 'main'}`,
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      diagnostic.hasWorkflowFile = wfRes.ok;

      // 4. Check recent runs
      const runs = await getWorkflowRuns(token, owner, repoName);
      if (runs.length > 0) {
        diagnostic.recentRunStatus = runs[0].conclusion || runs[0].status;
        if (runs[0].conclusion === 'failure') {
          diagnostic.identifiedIssue = 'GitHub Actions Workflow Failed in Recent Run';
          diagnostic.recommendedAction = `Go to https://github.com/${owner}/${repoName}/actions/runs/${runs[0].id} to view the log. We have updated the workflow with a guaranteed Gradle build and continue-on-error release fix!`;
        }
      }
    } else {
      diagnostic.identifiedIssue = 'Repository Not Found';
      diagnostic.recommendedAction = `Click "Publish Repository to GitHub" to automatically initialize the repository "${repoName}".`;
    }
  } catch {
    diagnostic.identifiedIssue = 'Failed to connect to GitHub repository';
  }

  return diagnostic;
}
