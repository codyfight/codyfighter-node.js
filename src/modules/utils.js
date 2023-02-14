export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function codyfighterVariables(envs) {
  const envVariables = Object.entries(envs).map(([key, value]) => ({
    key,
    value,
  }));

  const codyfightersEnvVariables = envVariables.filter(({ key, value }) => {
    return key.startsWith("CKEY_") || key.startsWith("GAME_MODE_");
  });

  const mapCodyfighters = (data) => {
    const result = [];

    for (let i = 0; i < data.length; i += 2) {
      result.push({
        ckey: data[i].value,
        mode: data[i + 1].value,
      });
    }

    return result;
  };

  const codyfighters = mapCodyfighters(codyfightersEnvVariables);

  return codyfighters;
}
