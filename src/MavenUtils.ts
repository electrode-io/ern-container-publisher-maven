import fs from 'fs'
import os from 'os'
import path from 'path'
import { shell, log } from 'ern-core'

const HOME_DIRECTORY = os.homedir()
const FILE_REGEX = /^file:\/\//

export default class MavenUtils {
  public static mavenRepositoryType(
    mavenRepositoryUrl: string
  ): 'http' | 'file' | 'unknown' {
    if (mavenRepositoryUrl.startsWith('http')) {
      return 'http'
    } else if (mavenRepositoryUrl.startsWith('file')) {
      return 'file'
    }
    return 'unknown'
  }

  /**
   *  Build repository statement to be injected in Android build.gradle for publication target of generated container
   * @param mavenRepositoryUrl
   * @returns {string}
   */
  public static targetRepositoryGradleStatement(
    mavenRepositoryUrl: string,
    {
      mavenUser,
      mavenPassword,
    }: {
      mavenUser?: string
      mavenPassword?: string
    } = {}
  ): string | void {
    const repoType = this.mavenRepositoryType(mavenRepositoryUrl)
    if (repoType === 'file') {
      // Replace \ by \\ for Windows
      return `repository(url: "${mavenRepositoryUrl.replace(/\\/g, '\\\\')}")`
    } else if (repoType === 'http') {
      // User can pass userName as "value" or variable [mavenUser]
      const isMavenUserVar = mavenUser && mavenUser.lastIndexOf('[') === 0
      // User can pass password as "value" or variable [mavenPassword]
      const isMavenPwdVar =
        mavenPassword && mavenPassword.lastIndexOf('[') === 0
      let authBlock = ''
      // Check if mavenUser or mavenPassword is to be appended as variable in the authentication bean
      if (isMavenUserVar || isMavenPwdVar) {
        authBlock = `{ authentication(userName: ${mavenUser!.slice(
          1,
          -1
        )}, password: ${mavenPassword!.slice(1, -1)}) }`
      } // Check if mavenUser or mavenPassword is to be appended as value in the authentication bean
      else if (mavenUser || mavenPassword) {
        authBlock = `{ authentication(userName: "${mavenUser}", password: "${mavenPassword}") }`
      }
      // --config '{"mavenUser": "myUser","mavenPassword": "myPassword"}'
      // Result : "repository(url: "http://domain.name:8081/repositories") { authentication(userName: "myUser", password: "myPassword") }”
      // --config '{"mavenUser": "[myUserVar]","mavenPassword": "[myPasswordVar]”}'
      // Result : "repository(url: "http://domain.name:8081/repositories") { authentication(userName: myUserVar, password: myPasswordVar) }”
      // no config
      // Result : "repository(url: "http://domain.name:8081/repositories")
      return `repository(url: "${mavenRepositoryUrl}") ${authBlock}`
    }
  }

  public static getDefaultMavenLocalDirectory = () => {
    const pathToRepository = path.join(HOME_DIRECTORY, '.m2', 'repository')
    return `file://${pathToRepository}`
  }

  public static isLocalMavenRepo(repoUrl: string): boolean {
    if (repoUrl && repoUrl === MavenUtils.getDefaultMavenLocalDirectory()) {
      return true
    }
    return false
  }

  public static createLocalMavenDirectoryIfDoesNotExist() {
    const dir = MavenUtils.getDefaultMavenLocalDirectory().replace(
      FILE_REGEX,
      ''
    )
    if (!fs.existsSync(dir)) {
      log.debug(
        `Local Maven repository directory does not exist, creating one.`
      )
      shell.mkdir('-p', dir)
    } else {
      log.debug(`Local Maven repository directory already exists`)
    }
  }
}
