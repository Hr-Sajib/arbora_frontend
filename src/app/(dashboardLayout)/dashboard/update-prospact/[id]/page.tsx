import UpdateProspectPage from '@/Features/Prospact/updateProspactPage/updateProspactPage'


const UpdatePage =async ({ params }: { params: { id: string } }) => {
  const {id}=await params
  console.log("check id", id)
  return (
    <div>

      <UpdateProspectPage prospectId={id}/>



    </div>
  )
}

export default UpdatePage