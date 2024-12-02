import { open } from "lmdb";

(async () => {
  const [, , type, filename] = process.argv;
  const filepath = `./src/data/${filename ?? "index"}.db`;

  const DB = open({ path: filepath, compression: true });

  if (type === "summary") {
    const values = DB.getValues();

    let total = 0;

    for (const value of values) {
      if (value.question.images.length > 1 || value.answer.images.length > 1) {
        total += 1;
      }
    }

    console.log("Total : ", total);
    console.log("Total Entry: ", DB.getKeysCount());
    console.log("Percent : ", (total / DB.getKeysCount()) * 100);
  } else if (type === "last_index") {
    const keys = DB.getKeys();
    const totalKeys = DB.getKeysCount();

    const lastIndex = keys.slice(totalKeys - 1, totalKeys).asArray[0];
    console.log(lastIndex);
  } else {
    console.log("⚠️ Invalid command");
  }
})();
