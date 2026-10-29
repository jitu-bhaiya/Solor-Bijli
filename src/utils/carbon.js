export const DEFAULT_FACTOR = 0.82 // kg CO2 per kWh, approximate Indian grid average. Check the latest CEA figure.
export const KG_PER_TREE_YEAR = 21 // approximate CO2 absorbed by one mature tree per year
export const co2 = (kwh, factor = DEFAULT_FACTOR) => kwh * factor
export const trees = (kgPerYear) => kgPerYear / KG_PER_TREE_YEAR
