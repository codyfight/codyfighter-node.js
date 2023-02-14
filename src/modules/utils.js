export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function codyfighterVariables(envs) {
  const envVariables = Object.entries(envs).map(([key, value]) => ({
    key,
    value,
  }));

  const ckeys = envVariables.filter(({ key }) => key.startsWith("CKEY_"));

  const gameModes = envVariables.filter(({ key }) =>
    key.startsWith("GAME_MODE_")
  );

  const codyfighters = ckeys
    .map(({ key, value }, i) => {
      const ckey = value;
      const mode = gameModes.find(({ key }) => key === `GAME_MODE_${i}`)?.value;

      return { ckey, mode };
    })
    .filter((codyfighter) => codyfighter);

  console.log("*** codyfighters:", codyfighters);

  return codyfighters;
}
