import { createClient } from "contentful"

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
    fallback: false
  }
}

// get one item fro this particular page
// context has params fro this page slug-link
export const getStaticProps = async ({params}) => {
  const { items } = await client.getEntries({
    content_type: 'recepie',
    'fields.slug': params.slug
  })

  return {
    props: {
      recipe: items[0]
    }
  }
}


export default function RecipeDetails({recipe}) {
  return (
    <div>
      Recipe Details
      <br />
      {recipe.fields.title}
    </div>
  )
}