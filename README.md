[![Build Status](https://travis-ci.org/platformsh/platformsh-client-js.svg?branch=master)](https://travis-ci.org/platformsh/platformsh-client-js)
# Platform.sh API client

This is a isomorphic Javascript library for accessing the Platform.sh API.

We recommend you use the [Platform.sh CLI](https://github.com/platformsh/platformsh-cli) for most purposes.

## Install

Run ``` npm install platformsh-client ```

## Usage

```Javascript
import Client from 'platformsh-client';

const client = new Client({
  api_token: /* api token if you use it with NodeJS*/,
  redirect_uri: /* custom redirection uri if you use it in the browser (current uri by default)*/
});

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
