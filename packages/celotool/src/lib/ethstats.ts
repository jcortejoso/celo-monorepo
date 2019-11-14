import { installGenericHelmChart, removeGenericHelmChart } from 'src/lib/helm_deploy'
import { execCmdWithExitOnFailure } from 'src/lib/utils'
import { envVar, fetchEnv, isVmBased } from './env-utils'

const helmChartPath = '../helm-charts/ethstats'

export async function installHelmChart(celoEnv: string) {
  return installGenericHelmChart(celoEnv, releaseName(celoEnv), helmChartPath, helmParameters())
}

export async function removeHelmRelease(celoEnv: string) {
  await removeGenericHelmChart(releaseName(celoEnv))
}

export async function upgradeHelmChart(celoEnv: string) {
  console.info(`Upgrading helm release ${releaseName(celoEnv)}`)

  const upgradeCmdArgs = `${releaseName(
    celoEnv
  )} ${helmChartPath} --namespace ${celoEnv} ${helmParameters().join(' ')}`

  if (process.env.CELOTOOL_VERBOSE === 'true') {
    await execCmdWithExitOnFailure(`helm upgrade --debug --dry-run ${upgradeCmdArgs}`)
  }
  await execCmdWithExitOnFailure(`helm upgrade ${upgradeCmdArgs}`)
  console.info(`Helm release ${releaseName(celoEnv)} upgrade successful`)
}

function helmParameters() {
  return [
    `--set domain.name=${fetchEnv(envVar.CLUSTER_DOMAIN_NAME)}`,
    `--set ethstats.image.repository=${fetchEnv(envVar.ETHSTATS_DOCKER_IMAGE_REPOSITORY)}`,
    `--set ethstats.image.tag=${fetchEnv(envVar.ETHSTATS_DOCKER_IMAGE_TAG)}`,
    `--set ethstats.trusted_enodes='{${fetchEnv(envVar.ETHSTATS_TRUSTED_ENODES)}}'`,
    `--set ethstats.banned_enodes='{${fetchEnv(envVar.ETHSTATS_BANNED_ENODES)}}'`,
  ]
}

function releaseName(celoEnv: string) {
  return `${celoEnv}-ethstats`
}
