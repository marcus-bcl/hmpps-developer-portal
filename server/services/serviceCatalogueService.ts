import type { StrapiApiClient, RestClientBuilder } from '../data'
import {
  Product,
  Component,
  Team,
  ProductSet,
  ServiceArea,
  ProductListResponseDataItem,
  TeamListResponseDataItem,
  ComponentListResponseDataItem,
  ServiceAreaListResponseDataItem,
  ProductSetListResponseDataItem,
} from '../data/strapiApiTypes'

export default class ServiceCatalogueService {
  constructor(private readonly strapiApiClientFactory: RestClientBuilder<StrapiApiClient>) {}

  async getProducts(productIds?: number[], withEnvironments?: boolean): Promise<ProductListResponseDataItem[]> {
    const strapiApiClient = this.strapiApiClientFactory('')
    const productData = await strapiApiClient.getProducts(productIds, withEnvironments)

    const products = productData.data.sort(sortData)

    return products
  }

  async getComponents(): Promise<ComponentListResponseDataItem[]> {
    const strapiApiClient = this.strapiApiClientFactory('')
    const componentData = await strapiApiClient.getComponents()

    const components = componentData.data.sort(sortData)

    return components
  }

  async getTeams(expandProperties?: { products: boolean }): Promise<TeamListResponseDataItem[]> {
    const strapiApiClient = this.strapiApiClientFactory('')
    const teamData = await strapiApiClient.getTeams(expandProperties)

    const teams = teamData.data.sort(sortData)

    return teams
  }

  async getProductSets(): Promise<ProductSetListResponseDataItem[]> {
    const strapiApiClient = this.strapiApiClientFactory('')
    const productSetData = await strapiApiClient.getProductSets()

    const productSets = productSetData.data.sort(sortData)

    return productSets
  }

  async getServiceAreas(expandProperties?: { products: boolean }): Promise<ServiceAreaListResponseDataItem[]> {
    const strapiApiClient = this.strapiApiClientFactory('')
    const serviceAreaData = await strapiApiClient.getServiceAreas(expandProperties)

    const serviceAreas = serviceAreaData.data.sort(sortData)

    return serviceAreas
  }

  async getProduct(productId: string, withEnvironments?: boolean): Promise<Product> {
    const strapiApiClient = this.strapiApiClientFactory('')
    const productData = await strapiApiClient.getProduct(productId, withEnvironments)

    const product = productData.data?.attributes

    return product
  }

  async getTeam(teamId: string, withProducts?: boolean): Promise<Team> {
    const strapiApiClient = this.strapiApiClientFactory('')
    const teamData = await strapiApiClient.getTeam(teamId, withProducts)

    const team = teamData.data?.attributes

    return team
  }

  async getComponent(componentId: string): Promise<Component> {
    const strapiApiClient = this.strapiApiClientFactory('')
    const componentData = await strapiApiClient.getComponent(componentId)

    const component = componentData.data?.attributes

    return component
  }

  async getServiceArea(serviceAreaId: string, withProducts?: boolean): Promise<ServiceArea> {
    const strapiApiClient = this.strapiApiClientFactory('')
    const serviceAreaData = await strapiApiClient.getServiceArea(serviceAreaId, withProducts)

    const serviceArea = serviceAreaData.data?.attributes

    return serviceArea
  }

  async getProductSet(productSetId: string): Promise<ProductSet> {
    const strapiApiClient = this.strapiApiClientFactory('')
    const productSetData = await strapiApiClient.getProductSet(productSetId)

    const productSet = productSetData.data?.attributes

    return productSet
  }
}

const sortData = (
  dataItem:
    | ProductListResponseDataItem
    | TeamListResponseDataItem
    | ComponentListResponseDataItem
    | ServiceAreaListResponseDataItem
    | ProductSetListResponseDataItem,
  compareDataItem:
    | ProductListResponseDataItem
    | TeamListResponseDataItem
    | ComponentListResponseDataItem
    | ServiceAreaListResponseDataItem
    | ProductSetListResponseDataItem,
) => {
  if (dataItem.attributes.name < compareDataItem.attributes.name) {
    return -1
  }
  if (dataItem.attributes.name > compareDataItem.attributes.name) {
    return 1
  }

  return 0
}
