// dist/ 의 빌드 결과를 «HTML 파일 하나»로 합친다.
// 결과물은 인터넷·서버 없이 더블클릭만으로 열리며 외부 요청을 전혀 하지 않는다.
//
//   npm run build && node scripts/bundle-standalone.mjs [출력경로]
//
// 주의: 예전에 정규식으로 dist/index.html을 다시 파싱해 조립했다가,
// 자바스크립트 번들 안에 들어 있던 "</head>" 같은 문자열까지 삼켜서
// 스크립트가 두 번 들어가는 사고가 있었다. 그래서 파싱하지 않고
// 아래처럼 필요한 조각만 읽어 직접 조립한다.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const assetsDir = join(root, 'dist', 'assets')
const out = process.argv[2]
  ? resolve(process.argv[2])
  : join(root, 'dist', 'standalone.html')

const files = readdirSync(assetsDir)
const jsName = files.find((f) => f.endsWith('.js'))
const cssName = files.find((f) => f.endsWith('.css'))
if (!jsName || !cssName) {
  console.error('dist/assets 에서 js/css를 찾지 못했습니다. 먼저 npm run build 를 실행하세요.')
  process.exit(1)
}

const css = readFileSync(join(assetsDir, cssName), 'utf8')
// 인라인 스크립트 안에서 "</script"가 나오면 태그가 거기서 끊긴다.
const js = readFileSync(join(assetsDir, jsName), 'utf8').replaceAll('</script', '<\\/script')

const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#1a8fc7" />
    <title>토닥토닥 건강일기</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${js}</script>
  </body>
</html>
`

writeFileSync(out, html, 'utf8')
console.log(`${out}  (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB)`)
