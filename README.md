# Platform.sh API client

This is a isomorphic Javascript library for accessing the Platform.sh API.

Our API is not stable yet. We recommend you use the Platform.sh CLI for most purposes.

## Install

Run ``` npm install platformsh-client ```

## Usage

```Javascript
import Client from 'platformsh-client';

const client = new Client(/* api token if you use it with NodeJS*/);

client.getProjects().then(projects => {
  const project = projects[0];

  const giturl = project.getGitUrl();
});

```

## Development mode

Run ``` npm run dev ```

## Build

Run ``` npm run build ```

## Test

Run ``` npm test ```
