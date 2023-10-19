import { type RequestHandler, type Request, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import logger from '../../logger'
import { Environment } from '../data/strapiApiTypes'

type MonitorEnvironment = {
  componentId: number
  componentName: string
  environmentId: number
  environmentName: string
  environmentUrl: string
  environmentHealth: string
}

export default function routes({ serviceCatalogueService, redisService }: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(['/', '/:monitorType/:monitorName'], async (req, res) => {
    const monitorType = getMonitorType(req)
    const monitorName = getMonitorName(req)
    logger.info(`Request for ${monitorType}/${monitorName}`)
    const serviceAreas = await serviceCatalogueService.getServiceAreas()
    const serviceAreaList = serviceAreas.map(serviceArea => {
      return {
        value: serviceArea.id,
        text: serviceArea.attributes.name,
        selected: monitorType === 'serviceArea' && formatMonitorName(serviceArea.attributes.name) === monitorName,
      }
    })
    const teams = await serviceCatalogueService.getTeams()
    const teamList = teams.map(team => {
      return {
        value: team.id,
        text: team.attributes.name,
        selected: monitorType === 'team' && formatMonitorName(team.attributes.name) === monitorName,
      }
    })
    const products = await serviceCatalogueService.getProducts()
    const productList = products.map(product => {
      return {
        value: product.id,
        text: product.attributes.name,
        selected: monitorType === 'product' && formatMonitorName(product.attributes.name) === monitorName,
      }
    })

    serviceAreaList.unshift({ value: 0, text: '', selected: false })
    teamList.unshift({ value: 0, text: '', selected: false })
    productList.unshift({ value: 0, text: '', selected: false })

    return res.render('pages/monitor', {
      serviceAreaList,
      teamList,
      productList,
      monitorName,
      monitorType,
    })
  })

  get('/components/:monitorType/:monitorId?', async (req, res) => {
    const monitorType = getMonitorType(req)
    const monitorId = getMonitorId(req)
    const environments: MonitorEnvironment[] = []

    if (monitorType === 'all') {
      const products = await serviceCatalogueService.getProducts(null, true)

      products.forEach(product => {
        product.attributes.components.data.forEach(component => {
          const typedEnvironments = component.attributes.environments as Environment[]

          typedEnvironments.forEach(environment => {
            environments.push({
              componentId: component.id as number,
              componentName: component.attributes.name as string,
              environmentId: environment.id as number,
              environmentName: environment.name as string,
              environmentUrl: environment.url as string,
              environmentHealth: environment.health_path as string,
            })
          })
        })
      })
    }
    if (monitorType === 'product') {
      const product = await serviceCatalogueService.getProduct(monitorId, true)

      product.components.data.forEach(component => {
        const typedEnvironments = component.attributes.environments as Environment[]

        typedEnvironments.forEach(environment => {
          environments.push({
            componentId: component.id as number,
            componentName: component.attributes.name as string,
            environmentId: environment.id as number,
            environmentName: environment.name as string,
            environmentUrl: environment.url as string,
            environmentHealth: environment.health_path as string,
          })
        })
      })
    }
    if (monitorType === 'team') {
      const team = await serviceCatalogueService.getTeam(monitorId, true)

      team.products.data.forEach(product => {
        product.attributes.components.data.forEach(component => {
          const typedEnvironments = component.attributes.environments as Environment[]

          typedEnvironments.forEach(environment => {
            environments.push({
              componentId: component.id as number,
              componentName: component.attributes.name as string,
              environmentId: environment.id as number,
              environmentName: environment.name as string,
              environmentUrl: environment.url as string,
              environmentHealth: environment.health_path as string,
            })
          })
        })
      })
    }
    if (monitorType === 'serviceArea') {
      const serviceArea = await serviceCatalogueService.getServiceArea(monitorId, true)

      serviceArea.products.data.forEach(product => {
        product.attributes.components.data.forEach(component => {
          const typedEnvironments = component.attributes.environments as Environment[]

          typedEnvironments.forEach(environment => {
            environments.push({
              componentId: component.id as number,
              componentName: component.attributes.name as string,
              environmentId: environment.id as number,
              environmentName: environment.name as string,
              environmentUrl: environment.url as string,
              environmentHealth: environment.health_path as string,
            })
          })
        })
      })
    }

    return res.json(environments)
  })

  post('/queue', async (req, res) => {
    const streams = Object.keys(req.body?.streams).map(queueName => {
      return {
        key: queueName,
        id: req.body?.streams[queueName],
      }
    })

    const messages = await redisService.readStream(streams)

    return res.send(messages)
  })

  return router
}

function getMonitorId(req: Request): string {
  const { monitorId } = req.params

  if (!Number.isInteger(Number.parseInt(monitorId, 10))) {
    return '0'
  }

  return monitorId
}

function getMonitorType(req: Request): string {
  const { monitorType } = req.params

  return ['product', 'team', 'serviceArea'].includes(monitorType) ? monitorType : 'all'
}

function getMonitorName(req: Request): string {
  const monitorName = req.params?.monitorName || ''

  return monitorName.replace(/[^-a-z0-9]/g, '')
}

function formatMonitorName(name: string): string {
  const monitorName = name || ''

  return `${monitorName} `
    .trim()
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^-a-z0-9]/g, '')
    .replace(/-+/g, '-')
}
