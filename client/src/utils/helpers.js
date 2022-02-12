export function pluralize(name, count) {
  if (count === 1) {
    return name;
  }
  return name + "s";
}

export function idbPromise(storeName, method, object) {
  return new Promise((resolve, reject) => {
    // open connection to db 'shop-shop' version 1
    const request = window.indexedDB.open("shop-shop", 1);

    // create variables to hold reference to db, transaction, and object store
    let db, tx, store;

    // if version has changed (or if first time using db), create the 3 object stores
    request.onupgradeneeded = function (e) {
      const db = request.result;
      // create object store for each type of data and set "primary" key index to be the '_id' of the data
      db.createObjectStore("products", { keyPath: _id });
      db.createObjectStore("categories", { keyPath: _id });
      db.createObjectStore("cart", { keyPath: _id });
    };

    // handle any errors when connecting
    request.onerror = function (e) {
      console.log("There was an error.");
    };

    // on db open success
    request.onsuccess = function (e) {
      // save a reference to the db
      db = request.result;
      // open a transction to do whatever we pass into storeName
      tx = db.transaction(storeName, "readwrite");
      // save a reference to that object store
      store = tx.objectStore(storeName);

      // log any errors
      db.onerror = function (e) {
        console.log("error", e);
      };

      switch (method) {
        case "put":
          store.put(object);
          resolve(object);
          break;
        case "get":
          const all = store.getAll();
          all.onsuccess = function () {
            resolve(all.result);
          };
          break;
        case "delete":
          store.delete(object._id);
          break;
        default:
          console.log("Not a valid method!");
          break;
      }

      // when transction is complete, close connection
      tx.oncomplete = function () {
        db.close();
      };
    };
  });
}
