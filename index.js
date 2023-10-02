const express = require("express");
const cors = require("cors");
const _ = require("lodash");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

let DATA = {};

const getResult = async () => {
  await fetch("https://intent-kit-16.hasura.app/api/rest/blogs", {
    headers: {
      "x-hasura-admin-secret":
        "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      DATA = { ...DATA, data };
    })
    .catch((err) => console.log(err));
};

app.get("/api/blog-stats", async (req, res) => {
  try {
    let arr = [];
    let cnt = 0;
    let maxLength = 0;
    let maxLengthWord = "";
    DATA = {};
    await getResult();
    const { data } = DATA;
    let length = _.size(data.blogs);
    _.filter(data.blogs, function (blog) {
      arr.push(blog.title);
      if (blog.title.toLowerCase().includes("privacy")) {
        cnt++;
      }
      if (blog.title.length > maxLength) {
        maxLength = blog.title.length;
        maxLengthWord = blog.title;
      }
    });
    let uniqueArr = _.uniq(arr);
    res.send({
      noOfBlogs: length,
      longestTitle: maxLengthWord,
      titleContainsPrivacy: cnt,
      uniqueBlogTitles: uniqueArr,
    });
  } catch (error) {
    res.status(500).send("INTERNAL SERVER ERROR");
  }
});

app.get("/api/blog-search", async (req, res) => {
  try {
    DATA = {};
    let arr = [];
    await getResult();
    const { data } = DATA;
    const { query } = req.query;
    _.filter(data.blogs, function (blog) {
      if (blog.title.toLowerCase().includes(query) === true) {
        arr.push(blog);
      }
    });
    res.send(arr);
  } catch (error) {
    res.status(500).send("INTERNAL SERVER ERROR");
  }
});

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
