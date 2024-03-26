export type FormattedCost = {
  formatted: string;
  amount: number;
  currency_code: string;
  currency_symbol: string;
};

export type FormattedCostWithQuantity = FormattedCost & {
  quantity: number;
};

export type FormattedCostMeasure = FormattedCostWithQuantity & {
  usage_type: "measure";
  current_usage: number;
};

export type FormattedCostCounter = FormattedCostWithQuantity & {
  usage_type: "counter";
  current_usage: number;
  daily_average: number;
};

type MaybeComplex<T, IsComplex> = IsComplex extends true ? T : string;

export type MaybeComplexFormattedCost<IsComplex = false> = MaybeComplex<
  FormattedCost,
  IsComplex
>;

export type MaybeComplexFormattedCostWithQuantity<IsComplex = false> =
  MaybeComplex<FormattedCostWithQuantity, IsComplex>;

export type MaybeComplexFormattedCostMeasure<IsComplex = false> = MaybeComplex<
  FormattedCostMeasure,
  IsComplex
>;

export type MaybeComplexFormattedCostCounter<IsComplex = false> = MaybeComplex<
  FormattedCostCounter,
  IsComplex
>;
