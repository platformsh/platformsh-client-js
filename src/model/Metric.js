import Ressource from './Ressource';

const paramDefaults = {};

const diskMetricRequest = (fromHour = 1) => `SELECT
  MEAN("available:bytes") as available,
  MEAN("total:bytes") as total
  FROM disk WHERE time > now() - ${fromHour}h
  GROUP BY project,instance,volume,time(5m)`;

export default class Metrics extends Ressource {
  constructor(metric, url) {
    super(url, paramDefaults, {}, metric);
    this.results = {};
  }

  static get(params, url) {
    return super.get(url, {}, paramDefaults, params);
  }

  static getDiskMetrics(params, url) {
    return super.get(url, {}, paramDefaults, {
      q: diskMetricRequest(params.fromHour)
    });
  }
}
