import { IAuthors } from './types';
import {
  arrayFetch,
  convertColumnName,
  convertToRows,
  fetchData,
  saveToCSV,
} from './util';

(async () => {
  try {
    const allData = await fetchData();

    if (!allData || allData.message) {
      console.error('Error in fetch global data: ', allData);
      return false;
    }

    const authors: IAuthors[] = allData.map((k) => k.author);
    saveToCSV(
      'authors',
      convertColumnName(allData, 'author'),
      convertToRows(authors),
    );

    const exclusiveAuthors = authors.filter(
      (v, i, a) => a.findIndex((v2) => v2.id === v.id) === i,
    );
    saveToCSV(
      'exclAuthors',
      convertColumnName(allData, 'author'),
      convertToRows(exclusiveAuthors),
    );
    const followersUrls = exclusiveAuthors.map((k) => ({
      name: k.login,
      url: k.followers_url,
    }));

    const results = await Promise.all(arrayFetch(followersUrls, 'url')).then(
      (res) => {
        return res.reduce((out, arr, i) => {
          const a = arr.slice(0, 5);
          const compare = a.map((k) => `${followersUrls[i].name},${k.login}\n`);

          if (!!compare.length) out.push(compare);

          return out;
        }, []);
      },
    );
    saveToCSV('followers', 'committer,follower', results.flat(1).join(''));

    const comments = allData.map((k) => {
      const checkComments = k.commit && k.comments_url;
      return {
        repoUrl: k.html_url,
        lastComment: '',
        secondLastComment: '',
        comments_count: !!checkComments && k.commit.comment_count,
        commentsUrl: checkComments,
      };
    });
    const fetchComments = comments.filter((k) => !!k.comments_count && k);
    if (fetchComments.length) {
      Promise.all(arrayFetch(fetchComments, 'commentsUrl')).then((data) => {
        //do smth....
        console.log('get data: ', data);
      });
    }
    saveToCSV('comments', convertColumnName(comments), convertToRows(comments));
  } catch (err) {
    console.log('Error: ', err);
  }
})();
