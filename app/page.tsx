'use client'

import { Button, Container, Input, useToast } from '@chakra-ui/react';
import React, { useState, ChangeEvent } from 'react';
import * as cheerio from 'cheerio';
import { Workbook, Worksheet } from 'exceljs';
import { saveAs } from 'file-saver';
import { Parade } from '@/utils/Parade';
import { format, parse } from 'date-fns';

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

    const $duty_clerk_messages = $('div.message.default.clearfix div.text:contains("Parade State Summary")').parents('div.body');
    $duty_clerk_messages.each((index, element) => {
      const timeElement = $(element).find('div.pull_right.date.details[title]').first();
      const datetimeRawStr = timeElement.attr('title');
      if (!datetimeRawStr) {
        const rawParadeText = $(element).find('div.text').text();
        console.log(rawParadeText)
        return;
      }

      const paradeDate = parse(datetimeRawStr, 'dd.MM.yyyy HH:mm:ss \'UTC\'XXX', new Date());

      const rawParadeText = $(element).find('div.text').html();
      if (!rawParadeText) return;
      const cleanedParadeText = rawParadeText
        .replace(/<br>/g, '\n') // Replace <br> with \n
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .replace(/&nbsp;/g, ' '); // Replace &nbsp; with a space
      const parade = new Parade(cleanedParadeText);

      const headingColumnIndex = index + 2;
      worksheet.getCell(1, headingColumnIndex).value = formatWithPeriod(paradeDate);

      const attendances = parade.getAttendances();
      console.log(attendances);
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

function formatWithPeriod(date: Date) {
  console.log(date);
  const hour = date.getHours();
  console.log(hour);
  const period = hour >= 12 ? 'PM' : 'AM';
  console.log(period);
  return `${format(date, 'dd MMM')} (${period})`;
}
