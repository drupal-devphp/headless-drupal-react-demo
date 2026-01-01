import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE, getImageUrlFromIncluded } from "./api";

type Article = {
  id: string;
  attributes: any;
  relationships?: any;
};

const ArticleList: React.FC = () => {
  const [items, setItems] = useState<Article[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const url = `${API_BASE}/jsonapi/node/article?fields[node--article]=title,field_image,created,path&fields[user--user]=name&include=field_image,uid&sort=-created&page[limit]=10`;
        const res = await fetch(url, { credentials: "include" });
        const json = await res.json();
        setItems(json.data || []);
        setIncluded(json.included || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load articles");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <p>Loading articles…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="list">
      {items.map((item) => {
        const imageRel = item.relationships?.field_image?.data;
        const imageUrl = getImageUrlFromIncluded(included, imageRel?.id);

        // author
        const authorRel = item.relationships?.uid?.data;
        const author = included.find((i: any) => i.type === "user--user" && i.id === authorRel?.id);

        // Use path alias if available, otherwise fall back to UUID
        const articleUrl = item.attributes.path?.alias 
          ? `/article${item.attributes.path.alias}` 
          : `/articles/${item.id}`;

        return (
          <article key={item.id} className="card">
            {imageUrl && <img src={imageUrl} alt={item.attributes.title} className="card-img" />}
            <div className="card-body">
              <h3>{item.attributes.title}</h3>
              {author && <p className="meta">By {author.attributes.name}</p>}
              <Link to={articleUrl} className="more">Read more</Link>
            </div>
          </article>
        );
      })}
      {items.length === 0 && <p>No articles found.</p>}
    </div>
  );
};

export default ArticleList;
