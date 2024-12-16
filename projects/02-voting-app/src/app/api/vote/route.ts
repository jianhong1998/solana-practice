import {
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from '@solana/actions';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { NextRequest, NextResponse } from 'next/server';
import { Voting } from '@/../anchor/target/types/voting';
import IDL from '@/../anchor/target/idl/voting.json';
import { BN, Program } from '@coral-xyz/anchor';

export const GET = async () => {
  const actionMetadata: ActionGetResponse = {
    title: 'Vote for your favorite type of peanut butter!',
    description: 'Vote between chruncy and smooth peanut butter.',
    icon: 'https://dthezntil550i.cloudfront.net/au/latest/au2206231443275420023724849/c62972b0-dbe2-43cf-a27a-ae8edc1e474e.png',
    label: 'Vote',
    links: {
      actions: [
        {
          label: 'Vote for Crunchy',
          href: '/api/vote?candidate=Crunchy',
          type: 'post',
        },
        {
          label: 'Vote for Smooth',
          href: '/api/vote?candidate=Smooth',
          type: 'post',
        },
      ],
    },
  };

  return new NextResponse(JSON.stringify(actionMetadata), {
    headers: ACTIONS_CORS_HEADERS,
  });
};

export const OPTIONS = GET;

const generateErrorResponse = (params: {
  status: number;
  body: Record<string, unknown>;
}): NextResponse => {
  return new NextResponse(JSON.stringify(params.body), {
    headers: ACTIONS_CORS_HEADERS,
    status: params.status,
  });
};

export const POST = async (req: NextRequest) => {
  const validCandidate = new Set<string>(['Smooth', 'Crunchy']);

  const url = new URL(req.url);
  const candidate = url.searchParams.get('candidate') ?? '';

  if (!validCandidate.has(candidate)) {
    const status = 400;
    return generateErrorResponse({
      status,
      body: {
        message: `Invalid candidate: ${candidate}`,
        status,
      },
    });
  }

  const reqBody = (await req.json()) as ActionPostRequest;
  let voter: PublicKey;

  try {
    voter = new PublicKey(reqBody.account);
  } catch (error) {
    return generateErrorResponse({
      status: 400,
      body: {
        message: `Invalid voter account: ${reqBody.account}`,
      },
    });
  }

  const connection = new Connection('http://localhost:8899', 'confirmed');
  const program = new Program<Voting>(IDL as unknown as any, { connection });

  const instruction = await program.methods
    .vote(new BN(1), candidate)
    .accounts({
      signer: voter,
    })
    .instruction();

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  const transaction = new Transaction({
    blockhash,
    lastValidBlockHeight,
    feePayer: voter,
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      transaction,
      type: 'transaction',
    },
  });

  return new NextResponse(JSON.stringify(response), {
    headers: ACTIONS_CORS_HEADERS,
  });
};
