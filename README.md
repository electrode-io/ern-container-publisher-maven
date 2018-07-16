# Electrode Native Maven Container Publisher

This publisher can be used to publish Android Electrode Native Containers to a local or remote Maven repository.

## Usage

### **With `ern publish-container` CLI command**

**Required**

- `--publisher/-p` : `maven`
- `--platform` : `android`
- `--url/-u` : Url of the target maven repository to publish the container to
- `--config/-c` : A json string (or path to a json file) containing the following properties:
  - `artifactId` : The Maven artifact id to be used for the Container
  - `groupId` : The Maven group id to be used for the Container
  - `mavenUser` [Optional] : The username to use for publication **(*)** 
  - `mavenPassword` [Optional] : The password to use for publication **(*)**

**Optional**

- `--containerPath` : Path to the Container to publish.  
Defaults to the Electrode Native default Container Generation path (`~/.ern/containergen/out/[platform]` unless changed through config)

- `--containerVersion/-v` : Version of the Container to publish.  
Default to `1.0.0`

 The `ern publish-container` CLI command can be used as follow to manually publish a Container using the maven publisher :

```bash
$ ern publish-container --containerPath [pathToContainer] -p maven -v [containerVersion] -u [mavenRepoUrl] -c '{"artifactId":"[artifactId]", "groupId":"[groupId]", "mavenUser":"[mavenUser]", "mavenPasword":"[mavenPassword]"}'
```  

### **With Cauldron**

**Required**

- `--publisher/-p` : `maven`
- `--url/-u` : Url of the target maven repository to publish the container to

**Optional**

- `--config/-c` : A json string (or path to a json file) containing the following required properties:
  - `artifactId` : The artifact id to be used for the Container  
  Defaults to `[nativeAppName]-ern-container`
  - `groupId` : The group id to be used for the Container  
  Defaults to `com.walmartlabs.ern`
  - `mavenUser` [Optional] : The username to use for publication **(*)** 
  - `mavenPassword` [Optional] : The password to use for publication **(*)**

To automatically publish the Cauldron generated Containers of a target native application and platform, the `ern cauldron add publisher` command can be used as follow :

```bash
$ ern cauldron add publisher -p maven -u [mavenRepoUrl] -c '{"artifactId":"[artifactId]", "groupId":"[groupId]", "mavenUser":"[mavenUser]"", "mavenPassword": "[mavenPassword]"}' 
```

This will result in the following publisher entry in Cauldron :

```json
{
  "name": "maven",
  "url": "[mavenRepoUrl]",
  "extra": {
    "artifactId": "[artifactId]",
    "groupId" : "[groupIdVal]",
    "mavenUser": "[mavenUser]",
    "mavenPassword": "[mavenPassword]"
  }
}
```

This is only needed once. Once the configuration for the publisher is stored in Cauldron, any new Cauldron generated Container will be publihsed to maven.

### **Programatically**

```js
import MavenPublisher from 'ern-container-publisher-maven'
const publisher = new MavenPublisher()
publisher.publish(
  {
    /* Local file system path to the Container */
    containerPath: string
    /* Version of the Container. Maven artifact version */
    containerVersion: string
    /* Url of the maven repository. Default: maven local */
    url?: string
    /* Extra config specific to this publisher */
    extra?: {
      /* Artifact id to use for publication. Default: local-container */
      artifactId?: string
      /* Group id to use for publication. Default: com.walmartlabs.ern */
      groupId?: string
      /* Password to use for publication (*) */
      mavenPassword?: string
       /* User to use for publication (*) */
      mavenUser?: string
    }
  }
})
```


**(*)** [Maven Gradle Plugin](https://docs.gradle.org/current/userguide/maven_plugin.html) is being used for publication (This publisher injects the necessary in the Container build.gradle). The Maven plugin allows to provide the username and password as plain text strings or variable names. In the case of variable name, the strings are not stored directly in the `build.gradle` file but in the `~/.gradle/gradle.properties` file local to the machine running the publisher. 
The values used for `mavenUser`/`mavenPassword` in this publisher will end up being stored as plain text strings in the `build.gradle`. If you instead with to keep `mavenUser`/`mavenPassword` values out of the `build.gradle` file (probably for security reasons), you can enclose the values of `mavenUser`/`mavenPassword` in brackets. For example `[userVariableName]`. Doing so will allow you to keep an external `~/gradle/gradle.properties` file defining the `userVariableName` and its value.
