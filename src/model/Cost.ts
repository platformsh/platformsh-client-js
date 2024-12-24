export type FormattedCost = {
  formatted: string;
  amount: number;
  currency_code: string;
  currency_symbol: string;
};

export type FormattedCostWithQuantity = FormattedCost & {
  quantity: number;
};

export type FormattedCostWithUnitPrice = FormattedCost & {
  unit_price_formatted: string;
};

export type FormattedCostWithTitle = FormattedCost & {
  display_title: string;
};

export type FormattedCostMeasure = FormattedCostWithQuantity & {
  usage_type: "measure";
  current_usage: number;
  current_usage_formatted: string;
};

export type FormattedCostCounter = FormattedCostWithQuantity & {
  usage_type: "counter";
  current_usage: number;
  current_usage_formatted: string;
  daily_average?: number;
  custom_description?: string;
};

type MaybeComplex<T, IsComplex> = IsComplex extends true ? T : string;

export type MaybeComplexFormattedCost<IsComplex = false> = MaybeComplex<
  FormattedCost,
  IsComplex
>;

export type MaybeComplexFormattedCostWithUnitPrice<IsComplex = false> =
  MaybeComplex<FormattedCostWithUnitPrice, IsComplex>;

export type MaybeComplexFormattedCostWithQuantity<IsComplex = false> =
  MaybeComplex<FormattedCostWithQuantity, IsComplex>;

export type MaybeComplexFormattedCostWithTitle<IsComplex = false> =
  MaybeComplex<FormattedCostWithTitle, IsComplex>;

export type MaybeComplexFormattedCostMeasure<IsComplex = false> = MaybeComplex<
  FormattedCostMeasure,
  IsComplex
>;

export type MaybeComplexFormattedCostCounter<IsComplex = false> = MaybeComplex<
  FormattedCostCounter,
  IsComplex
>;
