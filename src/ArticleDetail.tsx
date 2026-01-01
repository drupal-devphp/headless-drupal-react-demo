import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE, getImageUrlFromIncluded } from "./api";

const ArticleDetail: React.FC = () => {
  const { id, alias } = useParams<{ id?: string; alias?: string }>();
  const [node, setNode] = useState<any>(null);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const articleId = id || alias;
    if (!articleId) return;

    const fetchNode = async () => {
      setLoading(true);
      try {
        let url: string;

        // Check if it's a UUID (contains hyphens and is from /articles/:id route)
        if (id && id.includes("-")) {
          // It's a UUID, fetch directly
          url = `${API_BASE}/jsonapi/node/article/${id}?fields[node--article]=title,body,created,field_image,path&fields[user--user]=name&include=field_image,uid`;
          const res = await fetch(url, { credentials: "include" });
          const json = await res.json();
          setNode(json.data);
          setIncluded(json.included || []);
        } else if (alias) {
          // It's a path alias from /article/:alias route
          // Try to fetch with a more flexible approach - fetch articles and match locally
          const cleanAlias = alias.startsWith("/") ? alias : "/" + alias;
          url = `${API_BASE}/jsonapi/node/article?fields[node--article]=title,body,created,field_image,path&fields[user--user]=name&include=field_image,uid&page[limit]=100`;
          
          const res = await fetch(url, { credentials: "include" });
          const json = await res.json();
          
          // Find article by matching path alias
          const article = json.data?.find((article: any) => {
            const articlePath = article.attributes?.path?.alias;
            return articlePath === cleanAlias || articlePath === "/" + alias;
          });
          
          if (!article) {
            console.error("Article not found for alias:", alias);
          }
          setNode(article || null);
          setIncluded(json.included || []);
        }
      } catch (err) {
        console.error("Error fetching article:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNode();
  }, [id, alias]);

  if (loading) return <p>Loading…</p>;
  if (!node) return <p>Article not found.</p>;

  const imageRel = node.relationships?.field_image?.data;
  const imageUrl = getImageUrlFromIncluded(included, imageRel?.id);
  const authorRel = node.relationships?.uid?.data;
  const author = included.find((i: any) => i.type === "user--user" && i.id === authorRel?.id);

  return (
    <div className="detail">
      <Link to="/articles" className="back">← Back to list</Link>
      <h2>{node.attributes.title}</h2>
      {author && <p className="meta">By {author.attributes.name}</p>}
      {imageUrl && <img src={imageUrl} alt={node.attributes.title} className="detail-img" />}
      <div className="body" dangerouslySetInnerHTML={{ __html: node.attributes.body?.processed || node.attributes.body?.value || "" }} />
    </div>
  );
};

export default ArticleDetail;
