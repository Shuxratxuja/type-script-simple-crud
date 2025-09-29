import axios from "axios"
import { useEffect, useState } from "react"

interface UseFetchUsers<T> {
    data: T | null,
    loading: boolean
    error: string | null
}

export function useFetch<T = unknown>(url: string): UseFetchUsers<T> {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        axios<T>(url)
            .then((res) => {
                setData(res.data)
                setLoading(false)
            })
            .catch((err) => {
                setError(err.message)
                setLoading(false)
            })
    }, [url])

    return {data, loading, error}
}