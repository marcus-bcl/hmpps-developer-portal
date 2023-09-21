import express from 'express'

import createError from 'http-errors'

import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { metricsMiddleware } from './monitoring/metricsApp'

import setUpCsrf from './middleware/setUpCsrf'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'

import indexRoutes from './routes'
import productRoutes from './routes/products'
import componentRoutes from './routes/components'
import teamRoutes from './routes/teams'
import productSetRoutes from './routes/productSets'
import serviceAreaRoutes from './routes/serviceAreas'
import monitorRoutes from './routes/monitor'

import type { Services } from './services'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(metricsMiddleware)
  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app, services.applicationInfo)
  app.use(setUpCsrf())

  app.use('/', indexRoutes(services))
  app.use('/products', productRoutes(services))
  app.use('/components', componentRoutes(services))
  app.use('/teams', teamRoutes(services))
  app.use('/product-sets', productSetRoutes(services))
  app.use('/service-areas', serviceAreaRoutes(services))
  app.use('/monitor', monitorRoutes(services))

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
