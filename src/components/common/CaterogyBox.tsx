
type Props = {
    title: string;
    content: string;
    img: string;
}

export const CaterogyBox = (props: Props) => {
    return (
        <div className="shrink-0 relative flex flex-col w-[170px] h-[255px] xs:w-[200px] xs:h-[300px] md:w-[240px] md:h-[360px] drop-shadow-custom bg-customGradient rounded-lg">
            <img
                className="top-0 left-0 w-full h-full rounded-lg object-cover"
                src={props.img}
                alt="Category image"
            />
            <div>
                <h4 className="z-20 font-extrabold text-xl sm:text-2xl text-center text-[#001839] mt-auto py-6">
                    {props.title}
                </h4>
                <p className="z-20 font-extrabold text-xl sm:text-xl text-center text-[#001839] mt-auto py-6">
                    {props.content}
                </p>
            </div>
            
        </div>
    );
};
