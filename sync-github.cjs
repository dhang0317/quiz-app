const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');

async function pushToGitHub(repoUrl, token, authorName = 'User', authorEmail = 'user@example.com') {
  const dir = process.cwd();
  console.log('準備同步專案至 GitHub...');

  // 1. 初始化
  await git.init({ fs, dir });

  // 2. 獲取所有檔案狀態並加入 stage
  const matrix = await git.statusMatrix({ fs, dir });
  for (const [filepath, head, workdir, stage] of matrix) {
    // 排除 node_modules 與 .git
    if (filepath.startsWith('node_modules') || filepath.startsWith('.git')) continue;
    if (workdir === 0) {
      await git.remove({ fs, dir, filepath });
    } else {
      await git.add({ fs, dir, filepath });
    }
  }

  // 3. 提交 Commit
  const sha = await git.commit({
    fs,
    dir,
    message: 'Update: monochrome UI, hybrid quiz, and eco AI generation',
    author: { name: authorName, email: authorEmail },
  });
  console.log('Commit 成功:', sha);

  // 4. 推送至遠端 GitHub
  console.log('正在推送到 GitHub:', repoUrl);
  const pushResult = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    url: repoUrl,
    ref: 'main',
    onAuth: () => ({ username: token }),
  });
  console.log('推送完成！Vercel 正在自動部署...', pushResult);
}

module.exports = { pushToGitHub };
