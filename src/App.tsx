
import { useForm, type SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "./components/ui/input"
import { Button } from "./components/ui/button"
import { instance } from "./api/intstance"
import { useFetch } from "./hooks/useFetch"
import { useMemo, useState } from "react"

type User = {
  id: number
  email: string
  password: string
  name: string
  role: string
  avatar: string
  creationAt?: string
  updatedAt?: string
}

const formSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo‘lishi kerak"),
  email: z.string().email("Email noto‘g‘ri"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo‘lishi kerak"),
  role: z.string().default("customer"),
  avatar: z.string().url("Avatar URL noto‘g‘ri")
})

type FormInput = z.input<typeof formSchema>
type FormOutput = z.infer<typeof formSchema>

function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [reloadKey, setReloadKey] = useState<number>(0)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "customer",
      avatar: ""
    }
  })


  const onSubmit: SubmitHandler<FormInput> = async (values) => {
    try {
      const payload: FormOutput = {
        ...values,
        role: values.role ?? "customer",
      }
      if (selectedUser) {
        const response = await instance.put(`/users/${selectedUser.id}`, payload)
        console.log("User updated:", response.data)
        alert("Foydalanuvchi yangilandi ✅")
      } else {
        const response = await instance.post("/users", payload)
        console.log("User created:", response.data)
        alert("Foydalanuvchi yaratildi ✅")
      }
      setSelectedUser(null)
      reset()
      setReloadKey((k) => k + 1)
    } catch (error) {
      console.error(error)
      alert("Xatolik yuz berdi ❌")
    }
  }

  const usersUrl = useMemo(() => `https://api.escuelajs.co/api/v1/users?t=${reloadKey}`, [reloadKey])
  const { data, loading, error } = useFetch<User[]>(usersUrl)

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    reset({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role || "customer",
      avatar: user.avatar,
    })
  }

  const handleCancelEdit = () => {
    setSelectedUser(null)
    reset()
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Haqiqatan ham o'chirmoqchimisiz?")
    if (!confirmed) return
    try {
      await instance.delete(`/users/${id}`)
      alert("Foydalanuvchi o'chirildi ✅")
      setReloadKey((k) => k + 1)
      if (selectedUser?.id === id) {
        setSelectedUser(null)
        reset()
      }
    } catch (error) {
      console.error(error)
      alert("O'chirishda xatolik yuz berdi ❌")
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Xatolik: {String(error)}</p>

  return (
    <div className="mt-12 flex flex-col items-center gap-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 w-[400px]"
      >
        <div>
          <Input placeholder="Name" {...register("name")} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <Input type="email" placeholder="Email or Phone Number" {...register("email")} />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <Input type="password" placeholder="Password" {...register("password")} />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <div>
          <Input placeholder="Role (default: customer)" {...register("role")} />
          {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
        </div>

        <div>
          <Input type="url" placeholder="https://your_avatar.com" {...register("avatar")} />
          {errors.avatar && <p className="text-red-500 text-sm">{errors.avatar.message}</p>}
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="bg-[#db4444] text-white py-4 rounded-md">
            {selectedUser ? "Update Account" : "Create Account"}
          </Button>
          {selectedUser && (
            <Button type="button" onClick={handleCancelEdit} className="py-4 rounded-md">
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-4 gap-6">
        {data?.map((user) => (
          <div key={user.id} className="border p-3 rounded shadow">
            <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
            <p className="mt-2 text-center">{user.name}</p>
            <div className="mt-3 flex gap-2 justify-center">
              <Button type="button" onClick={() => handleEdit(user)}>
                Edit
              </Button>
              <Button type="button" className="bg-red-600 text-white" onClick={() => handleDelete(user.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
