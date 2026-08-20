// ☁️ 클라우드 동기화 API (Vercel 서버리스 함수)
//
// 기록 전체를 «동기화 코드» 하나에 묶어 Postgres(Neon)에 보관한다.
//   GET  /api/sync?id=<코드>          → { data: 저장된 스냅샷 | null }
//   POST /api/sync  { id, data }      → { ok: true }
//
// Vercel 대시보드에서 Storage → Neon(Postgres)을 프로젝트에 연결하면
// DATABASE_URL 환경변수가 자동으로 주입된다.

import { neon } from '@neondatabase/serverless'

const ID_PATTERN = /^TODAK(-[A-Z0-9]{4}){3}$/

// 람다 인스턴스당 한 번만 테이블을 확인한다.
let tableReady = null
function ensureTable(sql) {
  if (!tableReady) {
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS todak_sync (
        sync_id    TEXT PRIMARY KEY,
        data       JSONB NOT NULL,
        updated_at BIGINT NOT NULL
      )
    `.catch((err) => {
      tableReady = null
      throw err
    })
  }
  return tableReady
}

export default async function handler(req, res) {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!dbUrl) {
    res.status(503).json({
      error:
        '데이터베이스가 연결되지 않았습니다. Vercel 대시보드 → Storage에서 Neon(Postgres)을 이 프로젝트에 연결하세요.',
    })
    return
  }

  const sql = neon(dbUrl)

  try {
    await ensureTable(sql)

    if (req.method === 'GET') {
      const id = String(req.query.id || '')
      if (!ID_PATTERN.test(id)) {
        res.status(400).json({ error: '동기화 코드 형식이 올바르지 않습니다.' })
        return
      }
      const rows = await sql`SELECT data FROM todak_sync WHERE sync_id = ${id}`
      res.status(200).json({ data: rows[0]?.data ?? null })
      return
    }

    if (req.method === 'POST') {
      const { id, data } = req.body ?? {}
      if (!ID_PATTERN.test(String(id))) {
        res.status(400).json({ error: '동기화 코드 형식이 올바르지 않습니다.' })
        return
      }
      if (typeof data !== 'object' || data === null || typeof data.updatedAt !== 'number') {
        res.status(400).json({ error: '스냅샷 형식이 올바르지 않습니다.' })
        return
      }
      const json = JSON.stringify(data)
      // Vercel 요청 본문 한도(4.5MB)보다 여유 있게 제한한다.
      if (json.length > 3_800_000) {
        res.status(413).json({ error: '데이터가 너무 큽니다. (사진은 동기화에서 제외됩니다)' })
        return
      }
      await sql`
        INSERT INTO todak_sync (sync_id, data, updated_at)
        VALUES (${id}, ${json}::jsonb, ${Date.now()})
        ON CONFLICT (sync_id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
      `
      res.status(200).json({ ok: true })
      return
    }

    res.status(405).json({ error: '지원하지 않는 메서드입니다.' })
  } catch (err) {
    res.status(500).json({ error: '서버 오류: ' + (err?.message ?? String(err)) })
  }
}
