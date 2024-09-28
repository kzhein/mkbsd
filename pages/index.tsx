import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface Props {
  wallpapers: Wallpaper[];
}

interface Wallpaper {
  label: string;
  blurHash: string;
  preview: string;
  sd: string;
  hd: string;
  searchTerms: string[];
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const [metadata, content, media] = await Promise.all([
    fetch(
      'https://storage.googleapis.com/panels-api/data/20240916/content-metadata-1a'
    ).then(res => res.json()),
    fetch(
      'https://storage.googleapis.com/panels-api/data/20240916/content-1a'
    ).then(res => res.json()),
    fetch(
      'https://storage.googleapis.com/panels-api/data/20240916/media-1a-c-p~a~n'
    ).then(res => res.json()),
  ]);

  const wallpapers: Wallpaper[] = content.wallpapers.map((wp: any) => ({
    label: wp.label,
    blurHash: wp.previews.standard[0].blurHash,
    preview:
      media.data[wp.previews.standard[0].id].wfs ||
      media.data[wp.previews.standard[0].id].s,
    sd: media.data[wp.dlm.sd].dsd,
    hd: media.data[wp.dlm.hd].dhd,
    searchTerms: [
      wp.label.toLowerCase(),
      ...metadata.remixMetadata
        .find((mt: any) => mt.remixId === wp.id)
        .searchTerms.map((st: any) => st.t),
    ],
  }));

  return {
    props: { wallpapers },
    revalidate: 1 * 60 * 60, //  1 hour cache
  };
};

export default function Home({ wallpapers }: Props) {
  const router = useRouter();
  const search = router.query?.search || '';

  let wallpapersToShow: Wallpaper[];

  if (!!search) {
    wallpapersToShow = wallpapers.filter(wp =>
      wp.searchTerms.some(st => st.includes((search as string).toLowerCase()))
    );
  } else {
    wallpapersToShow = wallpapers;
  }

  return (
    <div>
      <Head>
        <title>MKBSD</title>
      </Head>

      <h1 className='text-center text-6xl font-bold my-3'>MKBSD</h1>

      <div className='container mx-auto px-4 pb-4'>
        <div className='my-4'>
          <input
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-1/2 mx-auto p-2.5'
            placeholder='Search Wallpapers'
            type='text'
            value={search}
            onChange={e => {
              const url = new URL(window.location.href);
              url.searchParams.set('search', e.target.value);
              router.replace(url, undefined, { shallow: true });
            }}
          />
          {!!search && (
            <p className='my-2'>
              <span className='font-bold'>{wallpapersToShow.length}</span>{' '}
              wallpapers found
            </p>
          )}
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {wallpapersToShow.map(wp => (
            <a href={wp.hd} target='_blank' key={wp.hd}>
              <div className='cursor-pointer'>
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
    </div>
  );
}
