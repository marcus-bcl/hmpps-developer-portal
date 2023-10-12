import promClient from 'prom-client'
import { serviceCheckFactory } from '../data/healthCheck'
import config from '../config'
import type { AgentConfig } from '../config'
import type { ApplicationInfo } from '../applicationInfo'

const healthCheckGauge = new promClient.Gauge({
  name: 'upstream_healthcheck',
  help: 'health of an upstream dependency - 1 = healthy, 0 = not healthy',
  labelNames: ['service'],
})

interface HealthCheckStatus {
  name: string
  status: string
  message: unknown
}

interface HealthCheckResult extends Record<string, unknown> {
  status: string
  components: Record<string, unknown>
}

export type HealthCheckService = () => Promise<HealthCheckStatus>
export type HealthCheckCallback = (result: HealthCheckResult) => void

function service(name: string, url: string, agentConfig: AgentConfig): HealthCheckService {
  const check = serviceCheckFactory(name, url, agentConfig)
  return () =>
    check()
      .then(result => ({ name, status: 'UP', message: result }))
      .catch(err => ({ name, status: 'DOWN', message: err }))
}

function gatherCheckInfo(aggregateStatus: Record<string, unknown>, currentStatus: HealthCheckStatus) {
  return { ...aggregateStatus, [currentStatus.name]: { status: currentStatus.message } }
}

const apiChecks = [
  service('serviceCatalogue', `${config.apis.serviceCatalogue.url}/`, config.apis.serviceCatalogue.agent),
]

export default function healthCheck(
  applicationInfo: ApplicationInfo,
  callback: HealthCheckCallback,
  checks = apiChecks,
): void {
  Promise.all(checks.map(fn => fn())).then(checkResults => {
    const allOk = checkResults.every(item => item.status === 'UP') ? 'UP' : 'DOWN'

    const result = {
      status: allOk,
      components: checkResults.reduce(gatherCheckInfo, {}),
    }

    checkResults.forEach(item => {
      const val = item.status === 'UP' ? 1 : 0
      healthCheckGauge.labels(item.name).set(val)
    })

    callback(result)
  })
}
