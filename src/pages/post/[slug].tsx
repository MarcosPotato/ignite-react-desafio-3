import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head'
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  if(router.isFallback){
    return(
      <h1>Carregando...</h1>
    )
  }
  
  return(
    <>
    <Head>
      <title>{ post.data.title } | SpaceTraveling</title>
    </Head>
    <main className={ styles.container }>
      <div className={ styles.banner }>
        <img src={ post.data.banner.url } alt="banner"/>
      </div>
      <article className={ styles.postContainer }>
        <header className={ styles.postTitle }>
          <h1>{ post.data.title }</h1>
          <div>
            <p>
              <FiCalendar/> 
              { format(
                new Date(post.first_publication_date), 
                "dd MMM yyyy",
                {
                  locale: ptBR
                }
              ) }
            </p>
            <p>
              <FiUser/> 
              { post.data.author }
            </p>
            <p>
              <FiClock/> 
              4 min
            </p>
          </div>
        </header>
        <section className={ styles.postContent }>
          { post.data.content.map(item => (
            <>
              <h2 key={ item.heading }>{ item.heading }</h2>
              { item.body.map((paragraph, index) => (
                <p key={ index }>{ paragraph.text }</p>
              ))}
            </>
          ))}
        </section>
      </article>
    </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType("posts");

  return {
    paths: posts.results.map(post => ({
      params: { slug: post.uid }
    })),
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params

  const response = await prismic.getByUID("posts", slug?.toString());

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      author: response.data.author,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map((content: any) => ({
        body: content.body,
        heading: content.heading
      }))
    }
  }

  return {
    props: { post }
  }
};
