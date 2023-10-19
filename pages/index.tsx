import { Button, Container, Input, useToast } from '@chakra-ui/react';
import React, { useState, ChangeEvent } from 'react';
import * as cheerio from 'cheerio';
import { saveAs } from 'file-saver';
import { Parade } from '@/utils/Parade';
import { parse } from 'date-fns';
import { Workbook, Worksheet } from "exceljs";

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
      toast({
        description: 'Please upload a file',
        status: 'error',
        isClosable: true,
      });
      return;
    }
    if (!selectedFile.type.startsWith('text/html')) {
      toast({
        title: 'Only HTML files',
        description: 'Export chat history from telegram!',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);


    console.log('Selected file:', selectedFile.name);
    const fileContents = await selectedFile.text();
    const $ = cheerio.load(fileContents);

    const $duty_clerk_messages = $('div.message.default.clearfix div.text:contains("Parade State Summary")').parents('div.body');


    const reversedHtmlParades = $duty_clerk_messages.get();
    const htmlParades = reversedHtmlParades.reverse();
    const parades = htmlParades
      .map(htmlParade => {
        const element = $(htmlParade);
        const timeElement = element.find('div.pull_right.date.details[title]').first();
        const datetimeRawStr = timeElement.attr('title');
        if (!datetimeRawStr) return null;

        const paradeDate = parse(datetimeRawStr, 'dd.MM.yyyy HH:mm:ss \'UTC\'XXX', new Date());

        const rawParadeText = element.find('div.text').html();
        if (!rawParadeText) return null;

        const cleanedParadeText = rawParadeText
          .replace(/<br>/g, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ');

        return new Parade(cleanedParadeText, paradeDate);
      })


    let headingColumnIndex = 2;
    const workbook = new Workbook();
    parades.forEach((parade, index) => {
      if (!parade) return;
      const formattedDateStr = parade.getFormattedParadeDate();
      const weekOfMonth = parade.getParadeMonthandWeek();

      let worksheet = workbook.getWorksheet(weekOfMonth);
      if (!worksheet) {
        worksheet = workbook.addWorksheet(weekOfMonth);
        headingColumnIndex = 2;
      }
      worksheet.getColumn(1).key = "name";

      worksheet.getCell(1, headingColumnIndex).value = formattedDateStr;
      worksheet.getColumn(headingColumnIndex).key = formattedDateStr;

      const rawTrackedNames = worksheet.getColumn(1).values;
      const trackedNames = rawTrackedNames.filter(n => n);

      const attendances = parade.getAttendances();
      attendances.forEach((attendance, index) => {
        if (trackedNames.length < 1) {
          const nameIndex = index + 2;
          let row: any = {};
          row["name"] = attendance.name;
          row[formattedDateStr] = attendance.attendanceStatus;
          worksheet.insertRow(nameIndex, row);
          return;
        }

        const rowIndex = rawTrackedNames.indexOf(attendance.name);
        if (rowIndex < 2) {
          const lastRowIndex = rawTrackedNames.length;
          let row: any = {};
          row["name"] = attendance.name;
          row[formattedDateStr] = attendance.attendanceStatus;
          worksheet.insertRow(lastRowIndex, row);
          return;
        }
        const row = worksheet.getRow(rowIndex);
        row.getCell(formattedDateStr).value = attendance.attendanceStatus;
      });
      headingColumnIndex++;
    });

    workbook.eachSheet((worksheet) => {
      autoWidth(worksheet);
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


/**
 * Autofit columns by width
 *
 * @param worksheet {ExcelJS.Worksheet}
 * @param minimalWidth
 */
function autoWidth(worksheet: Worksheet, minimalWidth = 10) {
  worksheet.columns.forEach((column) => {
    let maxColumnLength = 0;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      maxColumnLength = Math.max(
        maxColumnLength,
        minimalWidth,
        cell.value ? cell.value.toString().length : 0
      );
    });
    column.width = maxColumnLength + 2;
  });
}
