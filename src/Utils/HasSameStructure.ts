export const hasSameStructure = (obj1: any, obj2: any): boolean => {
  const missingKeys = Object.keys(obj1).filter((key) => !(key in obj2));

  if (missingKeys.length > 0) {
    console.log("Clés manquantes dans la réponse de l'API :", missingKeys);
  }

  return missingKeys.length === 0;
};
