const { exec } = require("node:child_process");

var twirlTimer = (function () {
  var P = ["\\", "|", "/", "-"];
  var x = 0;
  return setInterval(function () {
    process.stdout.write("\r" + P[x++]);
    process.stdout.write(" Aguardando Postgres aceitar conexões");
    x &= 3;
  }, 250);
})();

function checkPostgres() {
  exec(
    "/usr/bin/docker exec postgres-dev pg_isready --host localhost",
    handleReturn,
  );

  function handleReturn(_error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      twirlTimer;
      checkPostgres();
      return;
    }

    twirlTimer.close();
    process.stdout.clearLine();
    console.log("\n🟢 Postgres está pronto e aceitando conexões! \n");
  }
}

checkPostgres();
