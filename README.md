# angular-multi-analytics

[![Build Status](https://travis-ci.org/cesarandreu/angular-multi-analytics.svg?branch=master)](https://travis-ci.org/cesarandreu/angular-multi-analytics)

## Installation

You can install angular-multi-analytics with bower:

```shell
bower install angular-multi-analytics
```

Otherwise you can download the files from the `dist` folder and include them in your project.

Then you must include `angular-multi-analytics` as a module dependency:

```javascript
var app = angular.module('app', ['angular-multi-analytics']);
```

## Usage

### Google Analytics

Add the script tag for the plugin you wish to use:

```html
<script src="angular-multi-analytics/plugins/google-analytics.js"></script>
```

Include the plugin as a module dependency:

```javascript
var app = angular.module('app', ['angular-multi-analytics', 'angular-multi-analytics.google-analytics']);
```

Keep the Google Analytics snippet in your page, but remove the pageview tracking command, depending on which snippet you're using it might be one of the following:

```javascript
_gaq.push(['_trackPageview']); // remove this
ga('send', 'pageview'); // or this
```

