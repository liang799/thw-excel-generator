'use client'

import { Button, Container, Input, useToast } from '@chakra-ui/react';
import React, { useState, ChangeEvent } from 'react';
import * as cheerio from 'cheerio';
import { Workbook, Worksheet } from 'exceljs';
import { saveAs } from 'file-saver';

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

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Parade Data');

    console.log('Selected file:', selectedFile.name);
    const fileContents = await selectedFile.text();
    const $ = cheerio.load(fileContents);

    $('div.message.default.clearfix div.text:contains("Parade State Summary")').each((index, element) => {
      const textWithBr = $(element).html(); // Get the HTML content with <br> tags
      if (!textWithBr) return;
      const paradeData = textWithBr.replace(/<br>/g, '\n');
      const lines = paradeData.split('\n');

      console.log(`Parade Data ${index + 1}:`);
      console.log(lines[3]);
      console.log(paradeData);

      const headingColumnIndex = index + 2;
      worksheet.getCell(1, headingColumnIndex).value = lines[3]; // get current date and set as header

      const sections = paradeData.split('\n\n');
      console.log(sections);
      const usersArray = sections.reduce((acc: any[], section: string) => {
        const users = parseSection(section);
        return acc.concat(users);
      }, []);

      console.log(usersArray)

    });
    const excelBlob = await workbook.xlsx.writeBuffer();
    const blob = new Blob([excelBlob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'example.xlsx');
    setIsLoading(false);
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


function parseSection(section: string): any[] {
  const lines = section.split('\n');
  const users = [];

  if (!lines[0].includes("/")) return users;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('-');

    if (parts.length < 2) { continue; }

    const name = parts[0].trim();
    const attendanceStatus = parts[1].trim();
    users.push({ name, attendanceStatus });
  }

  return users;
};