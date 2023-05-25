import { createClient } from "contentful"
import Image from 'next/image'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import Skeleton from "../../components/Skeleton"

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_KEY,
})


// get all items fro multimple static page generation
export const getStaticPaths = async () => {
  const res = await client.getEntries({content_type: 'recepie'})

  const paths = res.items.map(item => {
    return {
      params: {
        slug: item.fields.slug
      }
    }
  })

  return {
    paths,
    fallback: true
    // when falbac is set tu true, and user is trying to
    // get the page that doesnt exist yet (new recepie was added in CMS)
    // it will return the fallback version of this component and will 
    //generate it on the fly and then save this page on server fro future visits
    // it will rerun getStaticProps func on the fly
  }
}

// get one item fro this particular page
// context has params fro this page slug-link
export const getStaticProps = async ({params}) => {
  const { items } = await client.getEntries({
    content_type: 'recepie',
    'fields.slug': params.slug
  })

  if (!items.length) {
    return {
      redirect: {
        destination: '/',
        permament: false
        // conditional redirect
        // if the slug doent exist at all
      }
    }
  }

  return {
    props: {
      recipe: items[0],
      revalidate: 1 
      // REVALIDATE will update info on server to update data
      // from CMS, in other way we will get only data we first input
      // and no updates from CMS when adding a content
      // the number repeserents time, in this case 1 second
      // so it will check for updates from CMS every second
      // but it only regenerate the updates on the pages that already exist
      // not generating the new page
    }
  }
}


export default function RecipeDetails({recipe}) {
  if ( !recipe ) return <Skeleton/>

  const { featuredImage, title, cookingTime, ingredients, method } = recipe.fields

  return (
    <div>
      <div className="banner">
        <Image 
          src={'https:' + featuredImage.fields.file.url}
          width={featuredImage.fields.file.details.image.width}
          height={featuredImage.fields.file.details.image.height}
        />
        <h2>{ title }</h2>
      </div>

      <div className="info">
        <p>Takes about { cookingTime } mins to cook.</p>
        <h3>Ingredients:</h3>

        {ingredients.map(ing => (
          <span key={ing}>{ ing }</span>
        ))}
      </div>
        
      <div className="method">
        <h3>Method:</h3>
        <div>{documentToReactComponents(method)}</div>
      </div>

      <style jsx>{`
        h2,h3 {
          text-transform: uppercase;
        }
        .banner h2 {
          margin: 0;
          background: #fff;
          display: inline-block;
          padding: 20px;
          position: relative;
          top: -60px;
          left: -10px;
          transform: rotateZ(-1deg);
          box-shadow: 1px 3px 5px rgba(0,0,0,0.1);
        }
        .info p {
          margin: 0;
        }
        .info span::after {
          content: ", ";
        }
        .info span:last-child::after {
          content: ".";
        }
      `}</style>
    </div>
  )
}