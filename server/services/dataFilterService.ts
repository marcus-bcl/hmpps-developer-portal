import { MoJSelectDataItem } from '../@types'
import type { StrapiApiClient, RestClientBuilder } from '../data'
import { formatMonitorName, sortData } from '../utils/utils'

export default class DataFilterService {
  constructor(private readonly strapiApiClientFactory: RestClientBuilder<StrapiApiClient>) {}

  async getCustomComponentsDropDownList({
    customComponentName,
    useFormattedName = false,
  }: {
    customComponentName: string
    useFormattedName?: boolean
  }): Promise<MoJSelectDataItem[]> {
    const strapiApiClient = this.strapiApiClientFactory('')
    const customComponentsData = await strapiApiClient.getCustomComponents()
    const customComponents = customComponentsData.data.sort(sortData)
    const customComponentsList = customComponents.map(customComponent => {
      const formattedName = formatMonitorName(customComponent.attributes.name)

      return {
        value: useFormattedName ? formattedName : customComponent.id.toString(),
        text: customComponent.attributes.name,
        selected: formattedName === customComponentName,
      }
    })
    customComponentsList.unshift({ value: '', text: '', selected: false })

    return customComponentsList
  }

  async getServiceAreasDropDownList({
    serviceAreaName,
    useFormattedName = false,
  }: {
    serviceAreaName: string
    useFormattedName?: boolean
  }): Promise<MoJSelectDataItem[]> {
    const strapiApiClient = this.strapiApiClientFactory('')
    const serviceAreasData = await strapiApiClient.getServiceAreas()
    const serviceAreas = serviceAreasData.data.sort(sortData)
    const serviceAreaList = serviceAreas.map(serviceArea => {
      const formattedName = formatMonitorName(serviceArea.attributes.name)

      return {
        value: useFormattedName ? formattedName : serviceArea.id.toString(),
        text: serviceArea.attributes.name,
        selected: formattedName === serviceAreaName,
      }
    })
    serviceAreaList.unshift({ value: '', text: '', selected: false })

    return serviceAreaList
  }

  async getTeamsDropDownList({
    teamName,
    useFormattedName = false,
  }: {
    teamName: string
    useFormattedName?: boolean
  }): Promise<MoJSelectDataItem[]> {
    const strapiApiClient = this.strapiApiClientFactory('')
    const teamsData = await strapiApiClient.getTeams()
    const teams = teamsData.data.sort(sortData)
    const teamsList = teams.map(team => {
      const formattedName = formatMonitorName(team.attributes.name)

      return {
        value: useFormattedName ? formattedName : team.id.toString(),
        text: team.attributes.name,
        selected: formattedName === teamName,
      }
    })
    teamsList.unshift({ value: '', text: '', selected: false })

    return teamsList
  }

  async getProductsDropDownList({
    productName,
    useFormattedName = false,
  }: {
    productName: string
    useFormattedName?: boolean
  }): Promise<MoJSelectDataItem[]> {
    const strapiApiClient = this.strapiApiClientFactory('')
    const productsData = await strapiApiClient.getProducts({})
    const products = productsData.data.sort(sortData)
    const productsList = products.map(product => {
      const formattedName = formatMonitorName(product.attributes.name)

      return {
        value: useFormattedName ? formattedName : product.id.toString(),
        text: product.attributes.name,
        selected: formattedName === productName,
      }
    })
    productsList.unshift({ value: '', text: '', selected: false })

    return productsList
  }
}
