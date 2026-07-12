"use client"

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { GetCollectionBySlugDocument } from '@/graphql/generated'
import { toast } from 'sonner'
import CollectionPageView from '@/components/collection/details/CollectionPageView'

export default function CollectionBySlugPage() {
  const { username, slug } = useParams()
  const usernameParam = Array.isArray(username) ? username[0] : username || ""
  const slugParam = Array.isArray(slug) ? slug[0] : slug || ""

  const { data, loading, error } = useQuery(GetCollectionBySlugDocument, {
    variables: { username: usernameParam, slug: slugParam },
    skip: !usernameParam || !slugParam,
    fetchPolicy: 'cache-and-network'
  })

  useEffect(() => {
    if (error) toast.error(error.message || "Failed to retrieve asset data.")
  }, [error])

  return (
    <CollectionPageView
      loading={loading}
      error={error}
      collection={data?.getCollectionBySlug}
      referenceLabel={`${usernameParam}/${slugParam}`}
    />
  )
}