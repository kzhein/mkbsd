import type { GetStaticProps } from 'next';
import Image from 'next/image';

interface Props {
  wallpapers: Wallpaper[];
}

interface Wallpaper {
  label: string;
  blurHash: string;
  preview: string;
  sd: string;
  hd: string;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const [meta, wallpapersUrls] = await Promise.all([
    fetch(
      'https://storage.googleapis.com/panels-api/data/20240916/content-1a'
    ).then(res => res.json()),
    fetch(
      'https://storage.googleapis.com/panels-api/data/20240916/media-1a-c-p~a~n'
    ).then(res => res.json()),
  ]);

  const wallpapers: Wallpaper[] = meta.wallpapers.map((wp: any) => ({
    label: wp.label,
    blurHash: wp.previews.standard[0].blurHash,
    preview:
      wallpapersUrls.data[wp.previews.standard[0].id].wfs ||
      wallpapersUrls.data[wp.previews.standard[0].id].s,
    sd: wallpapersUrls.data[wp.dlm.sd].dsd,
    hd: wallpapersUrls.data[wp.dlm.hd].dhd,
  }));

  return {
    props: { wallpapers },
    revalidate: 1 * 60 * 60, //  1 hour cache
  };
};

export default function Home({ wallpapers }: Props) {
  return (
    <div>
      <h1 className='text-center text-6xl font-bold my-3'>MKBSD</h1>

      <div className='container mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {wallpapers.map(wp => (
          <a href={wp.hd} target='_blank' key={wp.hd}>
            <div className='cursor-pointer bg-white border border-gray-200 rounded-lg shadow overflow-hidden'>
              <Image
                unoptimized
                placeholder='empty'
                className='h-[500px] w-full object-cover'
                width={500}
                height={500}
                src={wp.sd}
                alt={wp.label}
              />
              <div className='p-2'>
                <p className='text-lg'>{wp.label}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
