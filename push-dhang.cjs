const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

async function syncToRepo(token = '') {
  const dir = process.cwd();
  const repoUrl = 'https://github.com/dhang0317/quiz-app.git';
  console.log('--- 開始同步至 GitHub ---');
  console.log('目標儲存庫:', repoUrl);

  // 初始化 repo
  await git.init({ fs, dir });

  // 檢查所有檔案並加入 stage
  const matrix = await git.statusMatrix({ fs, dir });
  let count = 0;
  for (const [filepath, head, workdir, stage] of matrix) {
    if (
      filepath.startsWith('node_modules') ||
      filepath.startsWith('.git') ||
      filepath.endsWith('.log')
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
  console.log(`已暫存 ${count} 個檔案`);

  // 建立 Commit
  try {
    const sha = await git.commit({
      fs,
      dir,
      message: 'feat: update monochrome UI, hybrid quiz, eco AI, and multi-passage clozes',
      author: {
        name: 'dhang0317',
        email: 'dhang0317@users.noreply.github.com',
      },
    });
    console.log('Commit 成功，SHA:', sha);
  } catch (err) {
    console.log('Commit 提示 (可能已是最新):', err.message);
  }

  // 設定遠端與分支
  await git.branch({ fs, dir, ref: 'main', checkout: true }).catch(() => {});

  if (token) {
    console.log('使用提供的 Token 進行授權推送...');
    const pushRes = await git.push({
      fs,
      http,
      dir,
      url: repoUrl,
      ref: 'main',
      force: true,
      onAuth: () => ({ username: token }),
    });
    console.log('推送成功！', pushRes);
  } else {
    console.log('嘗試無憑證或匿名推送 (若儲存庫需要權限將會提示)...');
    try {
      await git.push({
        fs,
        http,
        dir,
        url: repoUrl,
        ref: 'main',
      });
      console.log('推送成功！');
    } catch (e) {
      console.log('PUSH_AUTH_REQUIRED:', e.message);
    }
  }
}

const tokenArg = process.argv[2] || '';
syncToRepo(tokenArg).catch((e) => {
  console.error('執行過程出錯:', e);
});
