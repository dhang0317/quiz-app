const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');

async function syncToGitHub(token) {
  const dir = process.cwd();
  const repoUrl = 'https://github.com/dhang0317/quiz-app.git';
  console.log('--- 開始將 Vocabulum 液態毛玻璃 UI 同步至 GitHub ---');

  await git.init({ fs, dir });

  const matrix = await git.statusMatrix({ fs, dir });
  let count = 0;
  for (const [filepath, head, workdir, stage] of matrix) {
    if (
      filepath.startsWith('node_modules') ||
      filepath.startsWith('.git') ||
      filepath.endsWith('.log') ||
      filepath.startsWith('dist')
    ) {
      continue;
    }
    if (workdir === 0) {
      await git.remove({ fs, dir, filepath });
    } else {
      await git.add({ fs, dir, filepath });
      count++;
    }
  }
  console.log(`已加入 ${count} 個異動檔案`);

  const sha = await git.commit({
    fs,
    dir,
    message: 'feat: overhaul UI to Vocabulum liquid-glass design with blur glows and stats',
    author: {
      name: 'dhang0317',
      email: 'dhang0317@users.noreply.github.com',
    },
  });
  console.log('Commit 成功，SHA:', sha);

  await git.branch({ fs, dir, ref: 'main', checkout: true }).catch(() => {});

  console.log('推送到 GitHub...');
  const pushRes = await git.push({
    fs,
    http,
    dir,
    url: repoUrl,
    ref: 'main',
    force: true,
    onAuth: () => ({ username: token }),
  });
  console.log('推送成功！Vercel 正在自動部署...', pushRes.ok);
}

const token = process.argv[2] || '';
syncToGitHub(token).catch(console.error);
