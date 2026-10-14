export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  html_url: string;
  public_repos: number;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  clone_url: string;
  private: boolean;
}

export interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
}

const GITHUB_API_BASE = 'https://api.github.com';

export async function verifyGitHubToken(token: string): Promise<GitHubUser> {
  const res = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Invalid GitHub token. Please verify your token has "repo" and "workflow" scopes.');
  }

  return res.json();
}

export async function createGitHubRepo(
  token: string,
  repoName: string,
  isPrivate: boolean,
  description: string
): Promise<GitHubRepo> {
  const res = await fetch(`${GITHUB_API_BASE}/user/repos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
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
    // If already exists, return basic object
    if (res.status === 422 && err.message?.includes('already exists')) {
      const user = await verifyGitHubToken(token);
      return {
        name: repoName,
        full_name: `${user.login}/${repoName}`,
        html_url: `https://github.com/${user.login}/${repoName}`,
        clone_url: `https://github.com/${user.login}/${repoName}.git`,
        private: isPrivate,
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
  commitMessage: string
): Promise<void> {
  // Check if file exists to get sha
  let sha: string | undefined = undefined;
  try {
    const checkRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (checkRes.ok) {
      const data = await checkRes.json();
      sha = data.sha;
    }
  } catch {
    // File doesn't exist yet, which is expected
  }

  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: encodedContent,
      sha,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to commit ${filePath}: ${err.message || 'Unknown error'}`);
  }
}

export async function triggerApkWorkflow(
  token: string,
  owner: string,
  repo: string
): Promise<void> {
  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/build-apk.yml/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref: 'main',
    }),
  });

  if (!res.ok) {
    // If main fails, try master
    const retryRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/build-apk.yml/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'master',
      }),
    });

    if (!retryRes.ok) {
      const err = await retryRes.json().catch(() => ({}));
      throw new Error(`Failed to trigger workflow: ${err.message || 'Workflow file not found or Actions not enabled'}`);
    }
  }
}

export async function getWorkflowRuns(
  token: string,
  owner: string,
  repo: string
): Promise<WorkflowRun[]> {
  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.workflow_runs || [];
}
