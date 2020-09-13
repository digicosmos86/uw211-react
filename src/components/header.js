import React from "react"
import { useStaticQuery, graphql } from "gatsby"

export default function Header() {
  const data = useStaticQuery(graphql`
    query HeaderQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <header className="bg-blue pl-12 py-6 font-title font-bold text-2xl text-white mb-10">
      {data.site.siteMetadata.title}
    </header>
  )
}
