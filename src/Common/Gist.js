import GitHub from 'github-api';

export default class Gist {
  static api = new GitHub()
  static validGistLength = 20

  /*
  files: {
    "file1.txt": {
      content: "Aren't gists great!"
    }
  }
  */
  static create(files, description = '', private = false) {
    return this.api.getGist()
      .create({
        public: !private,
        description,
        files,
      })
      .then(({ data }) => {
        console.log('created gist data:', data);
      })
      .catch(e => {
        console.error('Cant\t create gist!');
        throw e;
      });
  }

  static get(id) {
    if (id.length !== this.validGistLength) {
      throw new Error('Invalid gist id');
    }

    return this.api.getGist(id)
      .read()
      .then(({ data }) => {
        console.log('readed gist data', data);
      })
      .catch(e => {
        console.error(`Cant\t read gist with id: ${ id }`);
        throw e;
      });
  }

  static delete(id) {
    if (id.length !== this.validGistLength) {
      throw new Error('Invalid gist id');
    }

    return this.api.getGist(id)
      .delete()
      .catch(e => {
        console.error(`Cant\t delete gist with id: ${ id }`);
        throw e;
      });
  }
}
