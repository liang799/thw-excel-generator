'use client'

import { Button, Container, Input, useToast } from '@chakra-ui/react';
import React, { useState, ChangeEvent } from 'react';
import * as cheerio from 'cheerio';

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return toast({
        description: 'Please upload a file',
        status: 'error',
        isClosable: true,
      });
    }
    if (!selectedFile.type.startsWith('text/html')) {
      return toast({
        title: 'Only HTML files',
        description: 'Export chat history from telegram!',
        status: 'error',
        isClosable: true,
      });
    }

    setIsLoading(true);

    console.log('Selected file:', selectedFile.name);
    const fileContents = await selectedFile.text();
    const $ = cheerio.load(fileContents);
    $('div.message.default.clearfix div.text:contains("Parade State Summary")').each((index, element) => {
      const textWithBr = $(element).html(); // Get the HTML content with <br> tags
      if (!textWithBr) return;
      const paradeData = textWithBr.replace(/<br>/g, '\n');

      console.log(`Parade Data ${index + 1}:`);
      console.log(paradeData);
    });
  };

  return (
    <Container>
      <Input type="file" onChange={handleFileChange} />
      <Button onClick={handleUpload} isLoading={isLoading}>
        Convert to Excel
      </Button>
    </Container>
  );
}
