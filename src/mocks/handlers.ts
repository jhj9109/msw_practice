// src/mocks/handlers.js
import { rest } from 'msw'

interface LoginBody {
  username: string
}

interface LoginResponse {
  username: string
  firstName: string
}

const handlers = [
  rest.get('/api/products', (req, res, ctx) => {
    // Get querystring : error_code
    const errorCode = req.url.searchParams.get('error_code')

    // 에러 코드 존재시 에러코드와 함께 응답 제공
    if (errorCode) {
      return res(
        ctx.status(Number(errorCode))
      )
    }

    return res(
      ctx.status(200),    // Http status code
      ctx.delay(1000),    // Delay time to response
      ctx.json({          // Resoponse body
        items: [
          { name: "product-1" },
          { name: "product-1" }
        ]
      })
    )
  }),
  rest.post<LoginBody, LoginResponse>('/api/login', async (req, res, ctx) => {
    const { username } = await req.json()
    return res(
      ctx.json({
        username,
        firstName: 'John'
      })
    )
  }),
]

export default handlers