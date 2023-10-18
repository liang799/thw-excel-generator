export function convertCapsWithSpacingToCamelCaseWithSpacing(input: string): string {
  const words = input.toLowerCase().split(' ');
  const camelWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  return camelWords.join(' ');
}

export function captializeRank(inputString: string): string {
  const regex = /^.{0,3}( |$)/; // Regular expression to check for spaces after the first three characters

  if (regex.test(inputString)) {
    return inputString.substring(0, 3).toUpperCase() + inputString.substring(3);
  }
  return inputString;
}
