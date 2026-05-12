
import ItemListRandom from "../components/itemListRandom";

export default function Home() {
  

    return (
        <div className="flex flex-col gap-4">
            <div className="h-[400px] rounded-xl bg-[url('/images/intro.jpg')] bg-cover bg-center" />
            <div className="flex flex-wrap gap-2">
                <ItemListRandom />
            </div>
        
        </div>
    );
}
