"use client"
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone'
import { Inbox, Loader2 } from "lucide-react";
import { uploadToS3 } from '@/lib/s3';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const FileUpload = () => {
  const router = useRouter()
  const [ uploading, setUploading] = useState(false)
  const { mutate, isPending } = useMutation({
    mutationFn: async ({ file_key, file_name}: { file_key: string; file_name: string;}) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      console.log("response.data", response.data)
      return response.data;
    },
  });
  const {getRootProps, getInputProps} = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFile) => {
      console.log('acceptedFile', acceptedFile)
      const file = acceptedFile[0]
      if (file.size > 10 * 1024 * 1024) {
        // bigger than 10mb!
        toast.error("File too large");
        return;
      }

      try {
        setUploading(true)
        const data = await uploadToS3(file);
        console.log('data', data)
        if (!data?.file_key || !data.file_name) {
          alert("Something went wrong");
          return;
        }
        mutate(data, {
          onSuccess: ({ chat_id }) => {
            console.log('chat_id', chat_id)
            toast.success("Chat created!");

            // after chat has created we push the router to chat page
            router.push(`/chat/${chat_id}`)
          },
          onError: (err) => {
            toast.error("Error creating chat");
            console.error(err);
          },
        })
      } catch (error) {
        
      } finally{
        setUploading(false)
      }
    }
  }); 
  return (
    <div className="p-2 bg-white rounded-xl">
      <div {...getRootProps({
        className: 'border-dashed border-2 rounded-x1 cursor-pointer bg-grey-50 py-8 flex justify-center items-center flex-col'
      })}>
        <input {...getInputProps}/>
        {uploading || isPending ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Spilling Tea to GPT...
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
